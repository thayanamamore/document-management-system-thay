const path = require('node:path');

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function getDownloadName(originalName) {
  return path.basename(originalName) || 'documento';
}

module.exports = {
  toPublicDocument,
  getDownloadName,
};
