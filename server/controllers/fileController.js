import { uploadFileService } from '../services/fileUploadService.js';
import { getAllFilesService, getFileById, deleteFileById, getScanStatisticsService, getInfectedFiles } from '../services/fileQueryService.js';
import logger from '../utils/logger.js';

export const uploadFile = async (req, res) => {
  try {
    const result = await uploadFileService(req);
    res.json(result);
  } catch (err) {
    logger.error('File upload controller error:', err);
    if (err.status) {
      res.status(err.status).json({ error: err.error });
    } else {
      res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
    }
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const result = await getAllFilesService(req.query, req.user);
    res.json(result);
  } catch (err) {
    logger.error('Get all files controller error:', err);
    res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
  }
};

export const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { file, filePath } = await getFileById(fileId, req.user);
        res.download(filePath, file.filename);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
}

export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        await deleteFileById(fileId, req.user);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteAllInfectedFiles = async (req, res) => {
    try {
        const infectedFiles = await getInfectedFiles(req.user);
        for (const file of infectedFiles) {
            console.log(`[DeleteInfected] Deleting file with id: ${file.id}`);
            await deleteFileById(file.id, req.user);
        }
        res.status(200).json({ message: 'All infected files deleted successfully' });
    } catch (error) {
        logger.error('[DeleteInfected] Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const exportScanReport = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        // Get all files and their scan info
        const result = await getAllFilesService({ limit: 10000, page: 1 }, req.user); // adjust limit as needed
        res.json({ files: result.files });
    } catch (err) {
        logger.error('Export scan report error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getScanStatistics = async (req, res) => {
  try {
    const stats = await getScanStatisticsService(req.user);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};