
import pool from '../config/db.js';

export const getAllFilesService = async (query) => {
  const { userId, fileId, filename, mimeType, infected, limit = 10, page = 1 } = query;

  let sql = `SELECT f.*, s.status AS scan_status, s.virus_name FROM files f LEFT JOIN scans s ON f.id = s.file_id`;
  let countSql = `SELECT COUNT(*) FROM files f LEFT JOIN scans s ON f.id = s.file_id`;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (userId) {
    conditions.push(`f.user_id = $${idx++}`);
    params.push(userId);
  }
  if (fileId) {
    conditions.push(`f.id = $${idx++}`);
    params.push(fileId);
  }
  if (filename) {
    conditions.push(`f.filename ILIKE $${idx++}`);
    params.push(`%${filename}%`);
  }
  if (mimeType) {
    conditions.push(`f.mime_type = $${idx++}`);
    params.push(mimeType);
  }
  if (infected !== undefined) {
    const scanStatus = (infected === 'true' || infected === '1') ? 'infected' : 'clean';
    conditions.push(`s.status = $${idx++}`);
    params.push(scanStatus);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
    countSql += ` WHERE ${conditions.join(' AND ')}`;
  }

  const offset = (page - 1) * limit;
  sql += ` ORDER BY f.uploaded_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const allFiles = await pool.query(sql, params);
  const totalCount = await pool.query(countSql, params.slice(0, params.length - 2));

  return {
    files: allFiles.rows,
    total: parseInt(totalCount.rows[0].count)
  };
};