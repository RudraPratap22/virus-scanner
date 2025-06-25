import express from 'express';
import { uploadFile, getAllFiles, downloadFile, deleteFile, deleteAllInfectedFiles, exportScanReport } from '../controllers/fileController.js';
import upload from '../config/multer.js'; 
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes with authMiddleware
router.post('/upload-file', authMiddleware, (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    uploadFile(req, res, () => {});
  });
});

router.get('/files', authMiddleware, getAllFiles);

router.get('/download/:fileId', authMiddleware, downloadFile);
router.delete('/delete/:fileId', authMiddleware, deleteFile);
router.delete('/delete-infected', authMiddleware, deleteAllInfectedFiles);
router.get('/export-report', authMiddleware, exportScanReport);

export default router;
