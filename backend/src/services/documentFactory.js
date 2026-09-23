const crypto = require('node:crypto');

function createDocumentFromFile(file, owner) {
  return {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || 'anonymous',
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
  };
}

module.exports = createDocumentFromFile;
