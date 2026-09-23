const path = require('node:path');

function toPublicDocument(document) {
  const { filename, path: storedPath, mimetype, ...publicDocument } = document;
  return publicDocument;
}

function getDownloadName(originalName) {
  const sanitizedName = path.basename(originalName).replace(/[\r\n]/g, '_');
  return sanitizedName || 'documento';
}

module.exports = {
  toPublicDocument,
  getDownloadName,
};
