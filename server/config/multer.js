import multer from 'multer';
import path from 'path';

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

export default upload;