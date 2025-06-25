import { getScanStatisticsService } from '../services/fileQueryService.js';
import pool from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

export const getScanStats = async (req, res) => {
  try {
    const stats = await getScanStatistics();
    res.json(stats);
  } catch (err) {
    console.error('Get scan stats controller error:', err);
    res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
  }
};
