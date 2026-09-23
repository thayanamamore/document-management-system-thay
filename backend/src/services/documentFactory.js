const { randomUUID } = require('node:crypto');

function normalizeOwner(owner) {
  if (typeof owner !== 'string') {
    return 'anonymous';
  }

  const trimmedOwner = owner.trim();
  return trimmedOwner || 'anonymous';
}

function createDocumentFromFile(file, owner) {
  return {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: normalizeOwner(owner),
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
  };
}

module.exports = createDocumentFromFile;
