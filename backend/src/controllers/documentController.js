function createDocumentController(documentService) {
  function upload(req, res, next) {
    try {
      const owner = req.body.owner || req.get('x-user-id');
      const document = documentService.upload(req.file, owner);
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  }

  function list(req, res, next) {
    try {
      res.json({ documents: documentService.list(req.query.owner) });
    } catch (error) {
      next(error);
    }
  }

  function download(req, res, next) {
    try {
      const document = documentService.getForDownload(req.params.id);
      res.download(document.path, document.downloadName, (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  return {
    upload,
    list,
    download,
  };
}

module.exports = createDocumentController;
