import { uploadFileService } from '../services/fileUploadService.js';
import { getAllFilesService } from '../services/fileQueryService.js';

export const uploadFile = async (req, res) => {
  try {
    const result = await uploadFileService(req);
    res.json(result);
  } catch (err) {
    console.error('File upload controller error:', err);
    if (err.status) {
      res.status(err.status).json({ error: err.error });
    } else {
      res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
    }
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const result = await getAllFilesService(req.query);
    res.json(result);
  } catch (err) {
    console.error('Get all files controller error:', err);
    res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
  }
};