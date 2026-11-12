import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFoundHandler, globalErrorHandler } from './shared/error-handler';
import createLogger from './shared/logger';
import { PORT } from './shared/config';

import authRoutes from './module-1-user-management/routes/auth';
import documentRoutes from './module-1-user-management/routes/documents';
import certificateRoutes from './module-1-user-management/routes/certificates';

import escrowRoutes from './module-2-marketplace/routes/escrow';
import listingRoutes from './module-2-marketplace/routes/listings';
import transferRoutes from './module-2-marketplace/routes/transfers';

import chatbotRoutes from './module-3-mcp-ai/routes/chatbot';
import mcpRoutes from './module-3-mcp-ai/routes/mcp';
import scamRoutes from './module-3-mcp-ai/routes/scam';

import geofenceRoutes from './module-4-geofencing/routes/geofence';
import projectRoutes from './module-4-geofencing/routes/projects';
import reportRoutes from './module-4-geofencing/routes/reports';

import auditRoutes from './module-5-blockchain/routes/audit';
import trustIndexRoutes from './module-5-blockchain/routes/trust-index';
import verifyRoutes from './module-5-blockchain/routes/verify';

const logger = createLogger('Server');
const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'planttrust-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Module 1: User Management & Corporate Registry
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/certificates', certificateRoutes);

// Module 2: Investor Marketplace & Investment Lifecycle
app.use('/api/escrow', escrowRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transfers', transferRoutes);

// Module 3: MCP-Driven Explainable AI & Chatbot
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/scam', scamRoutes);

// Module 4: Proof-of-Reality & Geofencing
app.use('/api/geofence', geofenceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);

// Module 5: Blockchain Auditing & Regulatory Dashboard
app.use('/api/audit', auditRoutes);
app.use('/api/trust-index', trustIndexRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/audit/trust-index', trustIndexRoutes);
app.use('/api/audit/verify', verifyRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`PlanTrust backend listening on port ${PORT}`);
  });
}

export default app;
module.exports = app;
