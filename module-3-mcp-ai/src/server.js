require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const { notFoundHandler, globalErrorHandler } = require('../../shared/error-handler');

const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.PORT || 3003;

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'module-3-mcp-ai',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ─────────────────────────────────────────────────────────────
// TODO: Mount route files as they are built
const mcpRoutes = require('./routes/mcp');
const chatbotRoutes = require('./routes/chatbot');
const scamRoutes = require('./routes/scam');
app.use('/api/mcp', mcpRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/scam', scamRoutes);

// ─── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Module 3 (MCP AI) listening on port ${PORT}`);
});

module.exports = app;

