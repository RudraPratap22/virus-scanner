import express from 'express';
import { scanFile } from '../controllers/scanController.js';

const router = express.Router();

router.post('/scan-file', scanFile);

export default router;
