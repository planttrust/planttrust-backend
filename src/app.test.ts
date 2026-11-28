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

  it('broken JSON returns 400 INVALID_JSON, not 500', async () => {
    const res = await request(createApp())
      .post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('a body over 1 MB returns 413 PAYLOAD_TOO_LARGE', async () => {
    const res = await request(createApp())
      .post('/api/users/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ big: 'x'.repeat(1_100_000) }));

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});
