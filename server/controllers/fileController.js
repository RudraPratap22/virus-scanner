import { uploadFileService } from '../services/fileUploadService.js';
import { getAllFilesService } from '../services/fileQueryService.js';

export const uploadFile = async (req, res) => {
  try {
    const result = await uploadFileService(req);
    res.json(result);
  } catch (err) {
    if (err.status) {
      res.status(err.status).json({ error: err.error });
    } else {
      res.status(500).send('Server Error');
    }
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const result = await getAllFilesService(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};