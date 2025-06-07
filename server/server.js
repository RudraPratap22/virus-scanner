import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import scanRoutes from './routes/scanRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Virus Scanner API Running ✅');
});

app.use('/api', fileRoutes);
app.use('/api', scanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
