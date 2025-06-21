import { uploadFileService } from '../services/fileUploadService.js';
import { getAllFilesService, getFileById, deleteFileById } from '../services/fileQueryService.js';

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

export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { file, filePath } = await getFileById(fileId);
        res.download(filePath, file.filename);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        await deleteFileById(fileId);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}