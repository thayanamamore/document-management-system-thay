# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web para que usuários enviem, consultem e baixem seus documentos, com arquivos armazenados exclusivamente no filesystem local e metadados mantidos em memória nesta primeira versão.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Validação básica da presença do arquivo enviado.
- Armazenamento dos arquivos em `backend/storage` usando `multer` com `diskStorage`.
- Geração de identificador único para cada documento.
- Registro em memória dos metadados do documento.
- Listagem dos documentos disponíveis para o usuário.
- Download de um documento pelo identificador.
- Associação simples do documento a um usuário por meio do campo `owner`.
- Interface React para upload, listagem e download.
- Tratamento de respostas de sucesso e erro no backend e no frontend.

### Fora do escopo

- Armazenamento externo, em nuvem ou em serviços de terceiros.
- Banco de dados persistente.
- Versionamento de documentos.
- Exclusão ou edição de documentos.
- Autenticação, autorização e cadastro de usuários completos.
- Compartilhamento entre usuários.
- Busca avançada, filtros ou paginação.
- Conversão, preview ou edição do conteúdo dos arquivos.
- Processamento assíncrono, antivírus ou OCR.
- Execução da implementação de backend e frontend nesta etapa de planejamento.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um documento por meio de uma requisição `multipart/form-data`. |
| RF-02 | O sistema deve rejeitar uma requisição de upload que não contenha arquivo. |
| RF-03 | O sistema deve gerar um identificador único para o documento recebido. |
| RF-04 | O sistema deve salvar o conteúdo do arquivo em `backend/storage` usando `multer` com `diskStorage`. |
| RF-05 | O sistema deve registrar os metadados do documento em memória após o upload. |
| RF-06 | O sistema deve retornar os metadados do documento criado após um upload bem-sucedido. |
| RF-07 | O usuário pode listar os documentos registrados. |
| RF-08 | A listagem deve retornar somente metadados, sem expor o caminho físico do arquivo. |
| RF-09 | O usuário pode solicitar o download de um documento informando seu identificador. |
| RF-10 | O sistema deve retornar o conteúdo binário e o nome original do arquivo no download. |
| RF-11 | O sistema deve retornar erro `404` quando o identificador solicitado não existir. |
| RF-12 | O sistema deve retornar erros HTTP consistentes para entradas inválidas e falhas de armazenamento. |
| RF-13 | A aplicação deve disponibilizar uma interface para selecionar e enviar arquivos. |
| RF-14 | A interface deve exibir a lista de documentos e permitir iniciar o download de cada item. |
| RF-15 | O documento deve ser associado ao identificador do usuário informado ou resolvido pela camada de entrada da aplicação. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS. |
| RNF-02 | O frontend deve usar React, Vite e componentes funcionais com Hooks. |
| RNF-03 | Os arquivos devem ser gravados somente no filesystem local da aplicação, em `backend/storage`. |
| RNF-04 | O upload deve usar `multer` com `diskStorage`; não devem ser usados provedores externos. |
| RNF-05 | Os metadados devem permanecer em memória nesta versão e podem ser perdidos ao reiniciar o processo. |
| RNF-06 | A configuração operacional, como porta e limites aplicáveis, deve usar variáveis de ambiente quando necessário, seguindo 12-Factor App. |
| RNF-07 | As camadas internas não devem depender diretamente de Express, Multer ou detalhes de transporte HTTP. |
| RNF-08 | O código deve manter responsabilidades separadas entre rotas, controllers, services e repositories. |
| RNF-09 | As respostas de erro devem ser previsíveis e não devem expor caminhos internos ou informações sensíveis. |
| RNF-10 | O sistema deve validar identificadores antes de acessar o filesystem. |
| RNF-11 | Os testes de backend devem usar o runner nativo `node:test` e validar o comportamento das rotas. |
| RNF-12 | O sistema deve funcionar em ambiente local sem depender de serviços externos para armazenamento. |

## 5. Modelo de dados

### 5.1 Metadados do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único público do documento. |
| `originalName` | string | Sim | Nome original enviado pelo usuário, usado na resposta e no download. |
| `size` | number | Sim | Tamanho do arquivo em bytes. Deve ser um número inteiro maior ou igual a zero. |
| `uploadedAt` | string | Sim | Data e hora do upload no formato ISO 8601 UTC. |
| `owner` | string | Sim | Identificador simples do usuário proprietário. |
| `filename` | string | Sim, interno | Nome seguro gerado para o arquivo salvo no storage. Não deve ser retornado na API pública. |
| `path` | string | Sim, interno | Caminho controlado pelo repository para localizar o arquivo. Não deve ser retornado na API pública. |

Exemplo de representação pública:

```json
{
  "id": "7d9f2a4e-7a0d-4b1b-a6f0-40bd4a2b8a12",
  "originalName": "contrato.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-23T14:30:00.000Z",
  "owner": "user-123"
}
```

### 5.2 Regras de persistência

- O arquivo físico deve ser salvo em `backend/storage`.
- O nome físico deve ser gerado pelo sistema para evitar colisões e não deve depender diretamente do nome original.
- O nome original deve ser preservado apenas como metadado.
- O registro em memória deve ser criado somente depois que o upload físico for concluído.
- Se o registro de metadados falhar após a gravação, o fluxo deve tratar a inconsistência e tentar remover o arquivo órfão.
- Ao reiniciar o backend, os arquivos podem continuar no filesystem, mas os metadados não serão reconstruídos nesta fase.

## 6. Contratos de API

A API deve ser exposta pelo backend. Quando consumida pelo frontend, o prefixo configurado no Vite deve encaminhar `/api` para o backend; os caminhos abaixo representam os endpoints funcionais do serviço.

### 6.1 POST `/upload`

Envia um documento para armazenamento local.

**Entrada**

- Content-Type: `multipart/form-data`.
- Campo obrigatório do formulário: `file`.
- Campo opcional ou resolvido pela aplicação: `owner`.

**Resposta `201 Created`**

```json
{
  "id": "7d9f2a4e-7a0d-4b1b-a6f0-40bd4a2b8a12",
  "originalName": "contrato.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-23T14:30:00.000Z",
  "owner": "user-123"
}
```

**Erros previstos**

- `400 Bad Request`: campo `file` ausente ou dados inválidos.
- `413 Payload Too Large`: arquivo acima do limite configurado, caso exista limite operacional.
- `500 Internal Server Error`: falha ao salvar o arquivo ou registrar os metadados.

Formato recomendado de erro:

```json
{
  "error": "Arquivo é obrigatório"
}
```

### 6.2 GET `/documents`

Lista os documentos registrados em memória.

**Entrada**

- Sem corpo.
- O parâmetro de consulta `owner` pode ser usado para filtrar os documentos do usuário quando esse fluxo estiver habilitado.

**Resposta `200 OK`**

```json
{
  "documents": [
    {
      "id": "7d9f2a4e-7a0d-4b1b-a6f0-40bd4a2b8a12",
      "originalName": "contrato.pdf",
      "size": 24576,
      "uploadedAt": "2026-09-23T14:30:00.000Z",
      "owner": "user-123"
    }
  ]
}
```

A lista vazia deve ser representada como `{"documents": []}`.

### 6.3 GET `/documents/:id/download`

Baixa o conteúdo binário do documento identificado por `id`.

**Entrada**

- Parâmetro de rota obrigatório: `id`.
- Sem corpo.

**Resposta `200 OK`**

- Corpo binário do arquivo.
- `Content-Type` compatível com o tipo do arquivo quando disponível.
- `Content-Disposition: attachment` com o nome original sanitizado.

**Erros previstos**

- `400 Bad Request`: identificador ausente ou inválido.
- `404 Not Found`: documento não registrado ou arquivo físico não encontrado.
- `500 Internal Server Error`: falha inesperada ao ler o arquivo.

### 6.4 GET `/health`

Endpoint auxiliar para verificar se o backend está disponível.

**Resposta `200 OK`**

```json
{
  "status": "ok"
}
```

## 7. Decisões arquiteturais

### 7.1 Backend

O backend deve seguir uma Clean Architecture simples com o fluxo de dependência:

`routes -> controllers -> services -> repositories`

- `routes/`: registra endpoints, middlewares de upload e encaminha a requisição.
- `controllers/`: lê a entrada HTTP, chama o service e monta status e resposta.
- `services/`: concentra regras de negócio, validações de caso de uso e transformação dos dados.
- `repositories/`: encapsula o armazenamento dos arquivos locais e dos metadados em memória.

As camadas de service e repository não devem conhecer objetos de resposta do Express. O controller não deve implementar regras de persistência. O uso de Multer deve ficar na borda HTTP e entregar ao service apenas os dados necessários do arquivo recebido.

### 7.2 Armazenamento

- Usar `multer.diskStorage`.
- Destino físico: `backend/storage`.
- Não usar S3, banco de dados, CDN, filesystem remoto ou serviço de upload externo.
- Manter metadados em uma estrutura em memória encapsulada pelo repository.
- Evitar retorno de caminhos físicos ao cliente.

### 7.3 Frontend

- Usar React com componentes funcionais e Hooks.
- Organizar a comunicação HTTP em `frontend/src/services`.
- Manter telas e componentes separados conforme as convenções existentes.
- Usar `fetch` através do prefixo `/api` e exibir estados de carregamento, sucesso, erro e lista vazia.

## 8. Plano de execução

O plano abaixo define a ordem de implementação. Nesta etapa, ele é somente planejamento e não inclui a criação ou execução dos arquivos de backend e frontend.

1. Confirmar os limites do MVP, os endpoints, o formato dos metadados e as regras de armazenamento local.
2. Preparar a configuração de ambiente, a pasta `backend/storage` e os limites operacionais do upload sem adicionar armazenamento externo.
3. Definir o contrato interno do repository para criar, listar e localizar documentos e para acessar os arquivos físicos.
4. Definir os casos de uso da camada de service: upload, listagem e download, incluindo validações e tratamento de inconsistências.
5. Definir controllers e rotas Express, integrando `multer` com `diskStorage` somente na borda HTTP.
6. Adicionar tratamento centralizado de erros e respostas HTTP consistentes, incluindo ausência de arquivo, documento inexistente e falhas de filesystem.
7. Criar testes de backend com `node:test` para upload, listagem, download, validações e cenários de erro.
8. Implementar o serviço de API do frontend usando `fetch` e o prefixo `/api` configurado no Vite.
9. Implementar os componentes e a página de upload, listagem e download com estados de carregamento, sucesso, erro e lista vazia.
10. Executar testes do backend, lint/type checks disponíveis e validação manual dos fluxos completos com o backend e o frontend em execução.
11. Revisar segurança básica, isolamento das camadas, exposição de metadados, sanitização de nomes e ausência de dependências externas de storage.
12. Atualizar a documentação operacional somente após a implementação validada, mantendo esta especificação como referência do escopo.

## 9. Critérios de aceite

- É possível enviar um arquivo válido e receber seus metadados com status `201`.
- O arquivo enviado é criado em `backend/storage` por meio de `multer` com `diskStorage`.
- Um upload sem arquivo retorna erro `400` sem criar metadado inválido.
- A listagem retorna os metadados públicos sem caminhos físicos.
- Um documento existente pode ser baixado com seu nome original no header de resposta.
- Um identificador inexistente retorna `404`.
- Os metadados são mantidos em memória e não há dependência de banco ou storage externo.
- O frontend consegue executar upload, listagem e download usando a API definida.
- Os testes cobrem os fluxos principais e os erros de entrada, negócio e filesystem.
