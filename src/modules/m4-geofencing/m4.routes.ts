import { Router } from 'express';

export const m4Router = Router();

m4Router.get('/health', (_req, res) => {
  res.json({ module: 'm4-geofencing', status: 'ok' });
});
