import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join(process.cwd(), 'uploads'));
    cb(null, path.join(__dirname, '..', 'uploads'));
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