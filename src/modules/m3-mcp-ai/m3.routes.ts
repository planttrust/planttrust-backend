import { Router } from 'express';

export const m3Router = Router();

m3Router.get('/health', (_req, res) => {
  res.json({ module: 'm3-mcp-ai', status: 'ok' });
});
