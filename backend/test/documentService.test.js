const { test } = require('node:test');
const assert = require('node:assert/strict');
const createDocumentService = require('../src/services/documentService');

function createRepository() {
  const documents = new Map();

  return {
    create(document) {
      documents.set(document.id, document);
      return document;
    },
    findAll(owner) {
      const values = [...documents.values()];
      return owner ? values.filter((document) => document.owner === owner) : values;
    },
    findById(id) {
      return documents.get(id);
    },
  };
}

test('faz upload e retorna somente os metadados públicos', () => {
  const service = createDocumentService(createRepository());
  const document = service.upload({
    originalname: 'contrato.pdf',
    filename: 'arquivo-seguro.pdf',
    path: '/tmp/arquivo-seguro.pdf',
    size: 128,
    mimetype: 'application/pdf',
  }, 'user-1');

  assert.equal(document.originalName, 'contrato.pdf');
  assert.equal(document.size, 128);
  assert.equal(document.owner, 'user-1');
  assert.match(document.id, /^[a-f0-9-]{36}$/i);
  assert.equal('filename' in document, false);
  assert.equal('path' in document, false);
  assert.equal('mimetype' in document, false);
});

test('lista documentos e filtra por owner', () => {
  const repository = createRepository();
  const service = createDocumentService(repository);

  service.upload({ originalname: 'a.txt', filename: 'a.txt', path: '/tmp/a.txt', size: 1 }, 'user-1');
  service.upload({ originalname: 'b.txt', filename: 'b.txt', path: '/tmp/b.txt', size: 2 }, 'user-2');

  assert.equal(service.list().length, 2);
  assert.deepEqual(service.list('user-1').map((document) => document.originalName), ['a.txt']);
});

test('prepara o download com nome sanitizado', () => {
  const service = createDocumentService(createRepository());
  const uploaded = service.upload({
    originalname: '../../relatorio\nfinal.pdf',
    filename: 'relatorio.pdf',
    path: '/tmp/relatorio.pdf',
    size: 10,
  });

  const document = service.getForDownload(uploaded.id);

  assert.equal(document.downloadName, 'relatorio_final.pdf');
  assert.equal(document.path, '/tmp/relatorio.pdf');
});

test('rejeita upload sem arquivo e documento inexistente', () => {
  const service = createDocumentService(createRepository());

  assert.throws(() => service.upload(), (error) => error.statusCode === 400);
  assert.throws(() => service.getForDownload('invalid-id'), (error) => error.statusCode === 400);
  assert.throws(() => service.getForDownload('00000000-0000-0000-0000-000000000000'), (error) => error.statusCode === 404);
});
