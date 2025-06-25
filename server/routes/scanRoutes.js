import express from 'express';
import { getScanStatistics } from '../controllers/fileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, getScanStatistics);

export default router;
