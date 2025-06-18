// server/services/fileService.js
import pool from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { File } from '../entities/File.js';

export const uploadFileService = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!req.file) {
        return reject({ status: 400, error: 'No file uploaded' });
      }
      const { filename, size, path: filePath, mimetype } = req.file;

      // Insert file record
      const newFile = await pool.query(
        "INSERT INTO files (filename, aws3_key, file_size, user_id, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [filename, 'local', size, req.user ? req.user.id : null, mimetype]
      );
      const file_id = newFile.rows[0].id;

      // Create File instance
      const fileInstance = new File(newFile.rows[0]);

      // Prepare path for WSL
      const absPath = path.resolve(filePath || path.join(process.cwd(), 'uploads', filename));
      const wslPath = `/mnt/${absPath[0].toLowerCase()}/${absPath.slice(3).replace(/\\/g, '/')}`;

      // Run virus scan
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

        // Get ClamAV version
        exec('wsl clamscan -V', async (verr, vstdout) => {
          if (!verr && vstdout) scan_version = vstdout.trim();

          await pool.query(
            `INSERT INTO scans (file_id, status, virus_name, scan_log, scan_version, scanned_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [file_id, status, virus_name, scan_log, scan_version]
          );

          // Delete file from uploads
          try {
            fs.unlinkSync(filePath);
          } catch (deleteErr) {
            // Log error but don't fail the request
          }

          // Return result
          resolve({
            file: fileInstance,
            scan: { status, virus_name, scan_log, scan_version }
          });
        });
      });
    } catch (err) {
      reject({ status: 500, error: err.message });
    }
  });
};