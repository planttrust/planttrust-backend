import { Router } from 'express';

export const m5Router = Router();

m5Router.get('/health', (_req, res) => {
  res.json({ module: 'm5-audit', status: 'ok' });
});
