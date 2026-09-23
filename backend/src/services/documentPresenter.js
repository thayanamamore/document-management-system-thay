const path = require('node:path');

function toPublicDocument(document) {
  const { filename, path: storedPath, mimetype, ...publicDocument } = document;
  return publicDocument;
}

function getDownloadName(originalName) {
  return path.basename(originalName).replace(/[\r\n]/g, '_');
}

module.exports = {
  toPublicDocument,
  getDownloadName,
};
