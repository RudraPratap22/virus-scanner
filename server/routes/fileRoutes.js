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

const fileFilter = (req, file, cb) => {
  const disallowedExts = ['.exe'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (disallowedExts.includes(ext)) {
    return cb(new Error('Unsupported file type'));
  }
  if (file.size === 0) {
    return cb(new Error('File is empty'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, 
  fileFilter
});

router.post('/upload-file', (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 2GB limit' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    next();
  });
}, uploadFile);

router.get('/files', getAllFiles);

export default router;
