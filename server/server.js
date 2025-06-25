import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Example usage of logger
logger.info('Server starting...');

app.get('/', (req, res) => {
  res.send('Virus Scanner API Running ✅');
});

app.use('/api', fileRoutes);
app.use('/api', scanRoutes);

// Add global error handler for logging
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(400).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
