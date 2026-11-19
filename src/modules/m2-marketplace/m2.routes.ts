import { Router } from 'express';

export const m2Router = Router();

m2Router.get('/health', (_req, res) => {
  res.json({ module: 'm2-marketplace', status: 'ok' });
});
