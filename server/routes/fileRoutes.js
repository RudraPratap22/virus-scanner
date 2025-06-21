import express from 'express';
import { uploadFile, getAllFiles, downloadFile, deleteFile } from '../controllers/fileController.js';
import upload from '../config/multer.js'; 

const router = express.Router();

router.post('/upload-file', upload.single('file'), uploadFile);

router.get('/files', getAllFiles);

router.get('/download/:fileId', downloadFile);
router.delete('/delete/:fileId', deleteFile);

export default router;
