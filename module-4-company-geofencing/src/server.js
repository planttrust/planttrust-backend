require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.PORT || 3004;

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'module-4-company-geofencing',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────
// TODO: Mount route files as they are built
const projectRoutes = require('./routes/projects');
const reportRoutes = require('./routes/reports');
const geofenceRoutes = require('./routes/geofence');
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/geofence', geofenceRoutes);

// ─── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Module 4 (Company Geofencing) listening on port ${PORT}`);
});

module.exports = app;
