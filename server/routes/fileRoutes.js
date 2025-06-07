import express from 'express';
import { uploadFile, getAllFiles } from '../controllers/fileController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/upload-file', upload.single('file'), uploadFile);
router.get('/files', getAllFiles);

export default router;
