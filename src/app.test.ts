import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('app', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(createApp()).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'planttrust-backend' });
  });

  it('unknown routes return 404 in the standard error format', async () => {
    const res = await request(createApp()).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
