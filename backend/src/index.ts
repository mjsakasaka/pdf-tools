import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdf.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// PDF routes
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`[backend] PDF Tools API running on http://localhost:${PORT}`);
  console.log(`[backend] Health check: http://localhost:${PORT}/api/health`);
});
