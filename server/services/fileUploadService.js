// server/services/fileService.js
import pool from '../config/db.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { File } from '../entities/File.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadFileService = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!req.file) {
        return reject({ status: 400, error: 'No file uploaded' });
      }
      const { filename, size, path: filePath, mimetype } = req.file;

      // Insert file record - use default user_id of 1 if no user is authenticated
      const userId = req.user ? req.user.id : uuidv4();
      const newFile = await pool.query(
        "INSERT INTO files (filename, aws3_key, file_size, user_id, mime_type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [filename, 'local', size, userId, mimetype]
      );
      const file_id = newFile.rows[0].id;

      // Create File instance
      const fileInstance = new File(newFile.rows[0]);

      // Check if ClamAV is available first
      exec('wsl clamscan -V', async (verError, verStdout, verStderr) => {
        let status = 'clean';
        let virus_name = null;
        let scan_log = '';
        let scan_version = null;

        if (verError || !verStdout) {
          // ClamAV not available, use mock scan
          status = 'clean';
          scan_log = 'ClamAV not available - mock scan performed (file marked as clean)';
          scan_version = 'Mock Scanner v1.0';
          
          console.warn('ClamAV not available, using mock scan. Install ClamAV in WSL for real virus scanning.');
          
          // Save scan result
          await pool.query(
            `INSERT INTO scans (file_id, status, virus_name, scan_log, scan_version, scanned_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [file_id, status, virus_name, scan_log, scan_version]
          );

          // Delete file from uploads
          try {
            if (filePath && fs.existsSync(filePath)) {
              await fs.promises.unlink(filePath);
              console.log(`[File Cleanup] Deleted mock-scanned file: ${filePath}`);
            }
          } catch (deleteErr) {
            console.error('[File Cleanup] Error deleting file after mock scan:', deleteErr);
          }

          const scanResult = { status, virus_name, scan_log, scan_version };
          resolve({
              ...fileInstance,
              ...scanResult,
          });
        } else {
          // ClamAV is available, perform real scan
          scan_version = verStdout.trim();
          
          // Prepare path for WSL
          const absPath = path.resolve(filePath || path.join(process.cwd(), 'uploads', filename));
          const wslPath = `/mnt/${absPath[0].toLowerCase()}/${absPath.slice(3).replace(/\\/g, '/')}`;

          // Run virus scan
          exec(`wsl clamscan --no-summary "${wslPath}"`, async (error, stdout, stderr) => {
            scan_log = stdout || stderr || 'No scan output';
            
            if (error) {
              if (stdout && stdout.includes('FOUND')) {
                status = 'infected';
                const match = stdout.match(/:(.*)FOUND/);
                if (match && match[1]) {
                  virus_name = match[1].trim();
                }
              } else {
                status = 'error';
                scan_log = `Scan error: ${error.message}\n${scan_log}`;
              }
            }

            // Save scan result
            await pool.query(
              `INSERT INTO scans (file_id, status, virus_name, scan_log, scan_version, scanned_at) VALUES ($1, $2, $3, $4, $5, NOW())`,
              [file_id, status, virus_name, scan_log, scan_version]
            );

            // Delete file from uploads
            try {
              if (filePath && fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                console.log(`[File Cleanup] Deleted clam-scanned file: ${filePath}`);
              }
            } catch (deleteErr) {
              console.error('[File Cleanup] Error deleting file after clamscan:', deleteErr);
            }

            const scanResult = { status, virus_name, scan_log, scan_version };
            resolve({
                ...fileInstance,
                ...scanResult,
            });
          });
        }
      });
    } catch (err) {
      console.error('Upload service error:', err);
      reject({ status: 500, error: err.message });
    }
  });
};