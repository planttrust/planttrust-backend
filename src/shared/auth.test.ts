import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { env } from '../config/env';
import { requireAuth, requireRole, SESSION_COOKIE, setSessionCookie, signToken } from './auth';
import { errorHandler } from './errors';

function buildTestApp() {
  const app = express();
  app.use(cookieParser());
  app.get('/company-only', requireAuth, requireRole('company'), (req, res) => {
    res.json({ user: req.user });
  });
  app.post('/login-as-company', (_req, res) => {
    setSessionCookie(res, signToken({ id: 'u1', role: 'company' }));
    res.status(204).end();
  });
  app.use(errorHandler);
  return app;
}

describe('requireAuth / requireRole', () => {
  const app = buildTestApp();

  it('rejects a request with no token (401)', async () => {
    const res = await request(app).get('/company-only');
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret (401)', async () => {
    const fake = jwt.sign({ id: 'u1', role: 'company' }, 'not-the-real-secret');
    const res = await request(app).get('/company-only').set('Authorization', `Bearer ${fake}`);
    expect(res.status).toBe(401);
  });

  it('rejects an expired token (401)', async () => {
    const expired = jwt.sign({ id: 'u1', role: 'company' }, env.JWT_SECRET, { expiresIn: -10 });
    const res = await request(app).get('/company-only').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('rejects the wrong role (403)', async () => {
    const token = signToken({ id: 'u1', role: 'investor' });
    const res = await request(app).get('/company-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('lets the right role through and sets req.user', async () => {
    const token = signToken({ id: 'u1', role: 'company' });
    const res = await request(app).get('/company-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'u1', role: 'company' });
  });

  it('accepts a valid session cookie', async () => {
    const token = signToken({ id: 'u1', role: 'company' });
    const res = await request(app).get('/company-only').set('Cookie', `${SESSION_COOKIE}=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'u1', role: 'company' });
  });

  it('rejects a forged session cookie (401)', async () => {
    const fake = jwt.sign({ id: 'u1', role: 'company' }, 'not-the-real-secret');
    const res = await request(app).get('/company-only').set('Cookie', `${SESSION_COOKIE}=${fake}`);
    expect(res.status).toBe(401);
  });

  it('setSessionCookie sends an HttpOnly, SameSite=Lax cookie', async () => {
    const res = await request(app).post('/login-as-company');
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain(`${SESSION_COOKIE}=`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
  });
});
