require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'module-1-user-management',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────
// TODO: Mount route files as they are built
// const authRoutes = require('./routes/auth');
// const documentRoutes = require('./routes/documents');
// const certificateRoutes = require('./routes/certificates');
// app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/certificates', certificateRoutes);

// ─── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Module 1 (User Management) listening on port ${PORT}`);
});

module.exports = app;
