const path = require('node:path');
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const documentRepository = require('../repositories/documentRepository');
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
const documentService = createDocumentService(documentRepository);
const documentController = createDocumentController(documentService);
const router = express.Router();
const downloadRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de download. Tente novamente em instantes.',
  },
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', downloadRateLimiter, documentController.download);

module.exports = router;
