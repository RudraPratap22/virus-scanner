import pool from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { filename, size, path: filePath, mimetype } = req.file;

    
    const newFile = await pool.query(
      "INSERT INTO files (filename, aws3_key, file_size, user_id, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [filename, 'local', size, req.user ? req.user.id : null, mimetype]
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

        
        try {
          fs.unlinkSync(filePath);
          console.log(`File deleted from uploads: ${filename}`);
        } catch (deleteErr) {
          console.error(`Error deleting file: ${deleteErr.message}`);
        }
     
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
    const { userId, fileId, filename, mimeType, infected, limit = 10, page = 1 } = req.query;
    
    let query = `SELECT f.*, s.status AS scan_status, s.virus_name FROM files f LEFT JOIN scans s ON f.id = s.file_id`;
    let countQuery = `SELECT COUNT(*) FROM files f LEFT JOIN scans s ON f.id = s.file_id`;
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;

    
    if (userId) {
      
      conditions.push(`f.user_id = $${paramIndex++}`);
      queryParams.push(userId);
    }
    if (fileId) {
      conditions.push(`f.id = $${paramIndex++}`);
      queryParams.push(fileId);
    }
    if (filename) {
      conditions.push(`f.filename ILIKE $${paramIndex++}`);
      queryParams.push(`%${filename}%`);
    }
    if (mimeType) {
      // Note: 'mime_type' column must exist in the 'files' table for this filter to work
      conditions.push(`f.mime_type = $${paramIndex++}`);
      queryParams.push(mimeType);
    }
    if (infected !== undefined) {
      const scanStatus = (infected === 'true' || infected === '1') ? 'infected' : 'clean';
      conditions.push(`s.status = $${paramIndex++}`);
      queryParams.push(scanStatus);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY f.uploaded_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`; // Assuming 'uploaded_at' for ordering
    queryParams.push(limit, offset);

    const allFiles = await pool.query(query, queryParams);
    const totalCount = await pool.query(countQuery, queryParams.slice(0, queryParams.length - 2)); // Remove limit/offset from count query params

    res.json({
      files: allFiles.rows,
      total: parseInt(totalCount.rows[0].count)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
