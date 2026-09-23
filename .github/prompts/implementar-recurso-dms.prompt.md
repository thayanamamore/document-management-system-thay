---
description: "Implementa um recurso do DMS em Clean Architecture com rotas, regras de negócio, persistência e testes."
name: "Implementar recurso do DMS"
argument-hint: "recurso e endpoints (ex.: documents: POST /upload, GET /documents)"
agent: "agent"
---

# Implementar recurso do DMS

Implemente o recurso `${input:recurso:nome do recurso}` neste workspace seguindo as instruções do projeto e os contratos existentes em `docs/specs`.

Use estes endpoints como entrada da tarefa:

`${input:endpoints:liste os endpoints e seus métodos HTTP}`

## Contexto obrigatório

Antes de editar:

- Leia `.github/copilot-instructions.md`.
- Leia a especificação relevante em `docs/specs`.
- Inspecione os arquivos existentes em `backend/src` e os testes em `backend/test`.
- Preserve APIs, convenções e alterações existentes que não estejam relacionadas à tarefa.

## Arquitetura

Separe responsabilidades no backend usando o fluxo:

`routes -> controllers -> services -> repositories`

- `routes/` registra endpoints e middlewares de borda.
- `controllers/` trata entrada e saída HTTP.
- `services/` concentra regras de negócio e validações do caso de uso.
- `repositories/` encapsula persistência e não depende de Express.

As camadas internas não devem conhecer objetos de resposta do Express. Registre o roteador no ponto de composição da aplicação quando necessário.

## Persistência

- Para recursos de documentos, use somente filesystem local em `backend/storage`.
- Configure uploads com `multer` e `diskStorage`.
- Mantenha metadados em memória nesta fase.
- Nunca adicione armazenamento em nuvem, banco de dados ou serviço externo sem solicitação explícita.
- Não exponha caminhos físicos ou detalhes internos nos JSONs públicos.
- Valide identificadores antes de acessar arquivos.

## Implementação

- Use JavaScript, CommonJS no backend e as dependências já presentes no `package.json`.
- Use nomes descritivos em inglês e mensagens de usuário em português.
- Mantenha funções pequenas, sem abstrações que não sejam necessárias.
- Trate erros nos limites HTTP, incluindo entrada inválida, recurso inexistente e falhas de filesystem.
- Não altere frontend ou arquivos fora do recurso, exceto para registrar rotas ou atualizar testes necessários à integração.

## Verificação

Depois da implementação:

1. Execute `cd backend && npm test`.
2. Verifique os endpoints principais com um fluxo real quando houver upload, leitura ou download.
3. Execute uma checagem de erros nos arquivos alterados.
4. Informe os arquivos criados ou alterados, os comandos executados e qualquer limitação encontrada.

Não faça commit nem push automaticamente.
