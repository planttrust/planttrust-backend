import { Router } from 'express';

export const m1Router = Router();

m1Router.get('/health', (_req, res) => {
  res.json({ module: 'm1-users', status: 'ok' });
});
