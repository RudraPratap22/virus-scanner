import pool from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { filename, size, path: filePath } = req.file;

    
    const newFile = await pool.query(
      "INSERT INTO files (filename, aws3_key, file_size) VALUES ($1, $2, $3) RETURNING *",
      [filename, 'local', size]
    );
    const file_id = newFile.rows[0].id;

   
    const absPath = path.resolve(filePath || path.join(process.cwd(), 'uploads', filename));
    const wslPath = `/mnt/${absPath[0].toLowerCase()}/${absPath.slice(3).replace(/\\/g, '/')}`;

    // Run clamscan via WSL
    exec(`wsl clamscan --no-summary "${wslPath}"`, async (error, stdout, stderr) => {
      let status = 'clean';
      let virus_name = null;
      let scan_log = stdout || stderr;
      let scan_version = null;
      if (error) {
        if (stdout && stdout.includes('FOUND')) {
          status = 'infected';
          const match = stdout.match(/:(.*)FOUND/);
          if (match && match[1]) {
            virus_name = match[1].trim();
          }
        } else {
          status = 'error';
        }
      }
     
      exec('wsl clamscan -V', async (verr, vstdout) => {
        if (!verr && vstdout) scan_version = vstdout.trim();

        await pool.query(
          `INSERT INTO scans (file_id, status, virus_name, scan_log, scan_version, scanned_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [file_id, status, virus_name, scan_log, scan_version]
        );
     
        res.json({
          ...newFile.rows[0],
          scan: { status, virus_name, scan_log, scan_version }
        });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const allFiles = await pool.query("SELECT * FROM files");
    res.json(allFiles.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
