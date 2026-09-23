const path = require('node:path');
const { randomUUID } = require('node:crypto');

function normalizeOwner(owner) {
  if (typeof owner !== 'string') {
    return null;
  }

  const trimmedOwner = owner.trim();
  return trimmedOwner || null;
}

function createDocumentFromFile(file, owner) {
  return {
    id: randomUUID(),
    originalName: path.basename(file.originalname),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: normalizeOwner(owner),
    path: file.path,
  };
}

module.exports = createDocumentFromFile;
