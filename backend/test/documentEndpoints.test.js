const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

const storageDirectory = path.resolve(__dirname, '../storage');

async function readJson(response) {
  return response.json();
}

test('faz upload, lista e baixa um documento', async (t) => {
  const existingFiles = new Set(fs.readdirSync(storageDirectory));
  const server = app.listen(0);
  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    for (const file of fs.readdirSync(storageDirectory)) {
      if (!existingFiles.has(file)) {
        fs.rmSync(path.join(storageDirectory, file), { force: true });
      }
    }
  });

  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const formData = new FormData();
  formData.append('owner', 'ci-user');
  formData.append('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), 'teste.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert.equal(uploadResponse.status, 201);
  const uploadedDocument = await readJson(uploadResponse);
  assert.equal(uploadedDocument.originalName, 'teste.txt');
  assert.equal(uploadedDocument.owner, 'ci-user');
  assert.equal(typeof uploadedDocument.id, 'string');

  const listResponse = await fetch(`${baseUrl}/documents?owner=ci-user`);
  assert.equal(listResponse.status, 200);
  const list = await readJson(listResponse);
  assert.ok(list.documents.some((document) => document.id === uploadedDocument.id));

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteudo de teste');
  assert.match(downloadResponse.headers.get('content-disposition'), /teste\.txt/);
});
