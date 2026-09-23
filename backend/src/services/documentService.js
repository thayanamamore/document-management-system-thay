const createDocumentFromFile = require('./documentFactory');
const { toPublicDocument, getDownloadName } = require('./documentPresenter');

function createDocumentService(documentRepository) {
  function upload(file, owner) {
    if (!file) {
      const error = new Error('Arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const document = createDocumentFromFile(file, owner);

    try {
      return toPublicDocument(documentRepository.create(document));
    } catch (error) {
      const registrationError = new Error('Não foi possível registrar o documento');
      registrationError.statusCode = 500;
      registrationError.cause = error;
      throw registrationError;
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
      downloadName: getDownloadName(document.originalName),
    };
  }

  return {
    upload,
    list,
    getForDownload,
  };
}

module.exports = createDocumentService;
