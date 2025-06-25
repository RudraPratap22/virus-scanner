import { getScanStatisticsService } from '../services/fileQueryService.js';
import pool from '../config/db.js';
import { exec } from 'child_process';

export const getScanStats = async (req, res) => {
  try {
    const stats = await getScanStatistics();
    res.json(stats);
  } catch (err) {
    console.error('Get scan stats controller error:', err);
    res.status(500).json({ error: 'Server Error: ' + (err.message || 'Unknown error') });
  }
};

export const scanFile = (req, res) => {
  const { file_path, file_id } = req.body;

  if (!file_path || !file_id) {
    return res.status(400).json({ msg: 'file_path and file_id are required' });
  }

  exec(`clamscan ${file_path}`, async (err, stdout, stderr) => {
    if (err && err.code !== 1) {
      console.error(stderr);
      return res.status(500).json({ msg: 'Scan failed', error: stderr });
    }

    const infected = stdout.includes('FOUND');
    const virusName = infected ? stdout.split(':')[2].trim().replace('FOUND', '').trim() : null;

    try {
      const newScan = await pool.query(
        "INSERT INTO scans (file_id, status, virus_name) VALUES ($1, $2, $3) RETURNING *",
        [file_id, infected ? 'infected' : 'clean', virusName]
      );
      res.json({ result: newScan.rows[0], raw_output: stdout });
    } catch (dbErr) {
      console.error(dbErr.message);
      res.status(500).send('Database error');
    }
  });
};
