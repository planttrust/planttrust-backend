require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { notFoundHandler, globalErrorHandler } = require('./src/shared/error-handler');
const logger = require('./src/shared/logger')('Server');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'planttrust-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Module 1 — User Management & Corporate Registry ────────────────────
const authRoutes       = require('./src/module-1-user-management/routes/auth');
const documentRoutes   = require('./src/module-1-user-management/routes/documents');
const certificateRoutes = require('./src/module-1-user-management/routes/certificates');
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/certificates', certificateRoutes);

// ─── Module 2 — Investor Marketplace & Investment Lifecycle ─────────────
const escrowRoutes   = require('./src/module-2-marketplace/routes/escrow');
const listingRoutes  = require('./src/module-2-marketplace/routes/listings');
const transferRoutes = require('./src/module-2-marketplace/routes/transfers');
app.use('/api/escrow', escrowRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transfers', transferRoutes);

// ─── Module 3 — MCP-Driven Explainable AI & Chatbot ─────────────────────
const mcpRoutes     = require('./src/module-3-mcp-ai/routes/mcp');
const chatbotRoutes = require('./src/module-3-mcp-ai/routes/chatbot');
const scamRoutes    = require('./src/module-3-mcp-ai/routes/scam');
app.use('/api/mcp', mcpRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/scam', scamRoutes);

// ─── Module 4 — Company Portal & Proof-of-Reality (Geofencing) ──────────
const projectRoutes  = require('./src/module-4-geofencing/routes/projects');
const reportRoutes   = require('./src/module-4-geofencing/routes/reports');
const geofenceRoutes = require('./src/module-4-geofencing/routes/geofence');
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/geofence', geofenceRoutes);

// ─── Module 5 — Blockchain Auditing & Regulatory Dashboard ──────────────
const auditRoutes      = require('./src/module-5-blockchain/routes/audit');
const trustIndexRoutes = require('./src/module-5-blockchain/routes/trust-index');
const verifyRoutes     = require('./src/module-5-blockchain/routes/verify');
app.use('/api/audit', auditRoutes);
app.use('/api/trust-index', trustIndexRoutes);
app.use('/api/verify', verifyRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Start ───────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`PlanTrust backend listening on port ${PORT}`);
  });
}

module.exports = app;

