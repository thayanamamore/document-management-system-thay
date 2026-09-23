const path = require('node:path');
const multer = require('multer');
const express = require('express');
const createDocumentRepository = require('../repositories/documentRepository');
const createDocumentService = require('../services/documentService');
const createDocumentController = require('../controllers/documentController');

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../storage'),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({ storage });
const documentService = createDocumentService(createDocumentRepository);
const documentController = createDocumentController(documentService);
const router = express.Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
