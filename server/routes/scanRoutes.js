import express from 'express';
import { scanFile, getScanStats } from '../controllers/scanController.js';

const router = express.Router();

router.get('/stats', getScanStats);
router.post('/scan-file', scanFile);

export default router;
