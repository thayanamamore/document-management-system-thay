const crypto = require('node:crypto');
const path = require('node:path');

function createDocumentService(documentRepository) {
  function toPublicDocument(document) {
    const { filename, path: storedPath, mimetype, ...publicDocument } = document;
    return publicDocument;
  }

  function upload(file, owner) {
    if (!file) {
      const error = new Error('Arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const document = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner: owner || 'anonymous',
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
    };

    try {
      return toPublicDocument(documentRepository.create(document));
    } catch (error) {
      const cleanupError = new Error('Não foi possível registrar o documento');
      cleanupError.statusCode = 500;
      cleanupError.cause = error;
      throw cleanupError;
    }
  }

  function list(owner) {
    return documentRepository.findAll(owner).map(toPublicDocument);
  }

  function getForDownload(id) {
    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
      const error = new Error('Identificador de documento inválido');
      error.statusCode = 400;
      throw error;
    }

    const document = documentRepository.findById(id);

    if (!document) {
      const error = new Error('Documento não encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...document,
      downloadName: path.basename(document.originalName).replace(/[\r\n]/g, '_'),
    };
  }

  return {
    upload,
    list,
    getForDownload,
  };
}

module.exports = createDocumentService;
