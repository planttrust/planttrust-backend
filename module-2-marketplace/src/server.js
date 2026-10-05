require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.PORT || 3002;

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'module-2-marketplace',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────
// TODO: Mount route files as they are built
const escrowRoutes = require('./routes/escrow');
const listingRoutes = require('./routes/listings');
const transferRoutes = require('./routes/transfers');
app.use('/api/escrow', escrowRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transfers', transferRoutes);

// ─── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Module 2 (Marketplace) listening on port ${PORT}`);
});

module.exports = app;
