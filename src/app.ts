import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { m1Router } from './modules/m1-users/m1.routes';
import { m2Router } from './modules/m2-marketplace/m2.routes';
import { m3Router } from './modules/m3-mcp-ai/m3.routes';
import { m4Router } from './modules/m4-geofencing/m4.routes';
import { m5Router } from './modules/m5-audit/m5.routes';
import { errorHandler, notFound } from './shared/errors';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'planttrust-backend' });
  });

  app.use('/api/users', m1Router);
  app.use('/api/marketplace', m2Router);
  app.use('/api/mcp-ai', m3Router);
  app.use('/api/geofencing', m4Router);
  app.use('/api/audit', m5Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
