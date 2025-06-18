import express from 'express';
import { uploadFile, getAllFiles } from '../controllers/fileController.js';
import upload from '../config/multer.js'; 

const router = express.Router();

router.post('/upload-file', upload.single('file'), uploadFile);

router.get('/files', getAllFiles);

export default router;
