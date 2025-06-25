import express from 'express';
import {scanFile} from '../controllers/scanController.js';
import {getScanStatistics} from '../controllers/fileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, getScanStatistics);
router.post('/scan-file/:fileId', authMiddleware, scanFile);


export default router;
