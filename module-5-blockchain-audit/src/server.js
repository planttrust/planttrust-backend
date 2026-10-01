require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.PORT || 3005;

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'module-5-blockchain-audit',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────
// TODO: Mount route files as they are built
// const auditRoutes = require('./routes/audit');
// const trustIndexRoutes = require('./routes/trust-index');
// const verifyRoutes = require('./routes/verify');
// app.use('/api/audit', auditRoutes);
// app.use('/api/trust-index', trustIndexRoutes);
// app.use('/api/verify', verifyRoutes);

// ─── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Module 5 (Blockchain Audit) listening on port ${PORT}`);
});

module.exports = app;
