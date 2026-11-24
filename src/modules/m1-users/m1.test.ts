import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { prisma } from '../../shared/prisma';
import { userService } from './m1.service';

const app = createApp();

// Unique emails per run, so tests never clash with seed data, old runs or other test files.
const run = randomUUID().slice(0, 8);
const emailFor = (who: string) => `test-m1-${run}-${who}@plantrust.test`;
const password = 'correct-horse-9';

const investorBody = {
  role: 'investor',
  name: 'Test Investor',
  email: emailFor('investor'),
  password,
};

const companyBody = {
  role: 'company',
  name: 'Test Rep',
  email: emailFor('company'),
  password,
  company: {
    companyName: 'Test Estates (Pvt) Ltd',
    registrationNumber: `PV-TEST-${run}`,
    contactEmail: emailFor('contact'),
  },
};

const register = (body: object) => request(app).post('/api/users/register').send(body);
const login = (body: object) => request(app).post('/api/users/login').send(body);

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: `test-m1-${run}-` } } });
  await prisma.$disconnect();
});

describe('m1-users', () => {
  it('GET /api/users/health returns ok', async () => {
    const res = await request(app).get('/api/users/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm1-users', status: 'ok' });
  });

  describe('POST /register', () => {
    it('creates an investor, logs them in, and never returns the password', async () => {
      const res = await register(investorBody);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: expect.any(String), role: 'investor', name: 'Test Investor' });
      expect(String(res.headers['set-cookie'])).toContain('plantrust_session=');

      const row = await prisma.user.findUnique({
        where: { id: res.body.id },
        include: { investor: true },
      });
      expect(row?.email).toBe(investorBody.email);
      expect(row?.passwordHash).not.toBe(password);
      expect(row?.passwordHash.startsWith('$2')).toBe(true);
      expect(row?.investor?.kycStatus).toBe('pending');
    });

    it('creates a company with its company profile', async () => {
      const res = await register(companyBody);
      expect(res.status).toBe(201);
      expect(res.body.role).toBe('company');

      const company = await prisma.company.findUnique({ where: { userId: res.body.id } });
      expect(company?.companyName).toBe('Test Estates (Pvt) Ltd');
      expect(company?.registrationNumber).toBe(`PV-TEST-${run}`);
    });

    it('rejects an email that is already used, even in capitals (409)', async () => {
      const res = await register({ ...investorBody, email: investorBody.email.toUpperCase() });
      expect(res.status).toBe(409);
      expect(res.body.error.message).toBe('An account with this email already exists');
    });

    it('rejects a registration number that is already used (409)', async () => {
      const res = await register({ ...companyBody, email: emailFor('company2') });
      expect(res.status).toBe(409);
      expect(res.body.error.message).toBe(
        'A company with this registration number is already registered',
      );
    });

    it('refuses admin and regulator sign-up (403)', async () => {
      for (const role of ['admin', 'regulator']) {
        const res = await register({ ...investorBody, role, email: emailFor(role) });
        expect(res.status).toBe(403);
      }
    });

    it('needs company details for a company (400)', async () => {
      const res = await register({
        role: 'company',
        name: 'Test Rep',
        email: emailFor('nodetails'),
        password,
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('does not accept company details for an investor (400)', async () => {
      const res = await register({
        ...investorBody,
        email: emailFor('extra'),
        company: companyBody.company,
      });
      expect(res.status).toBe(400);
    });

    it('rejects a password shorter than 8 characters (400)', async () => {
      const res = await register({ ...investorBody, email: emailFor('short'), password: 'short' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /login', () => {
    const loginEmail = emailFor('login');
    let userId = '';

    beforeAll(async () => {
      const res = await register({ ...investorBody, email: loginEmail });
      userId = res.body.id;
    });

    it('logs in with the right workspace, and /me then returns the user', async () => {
      const agent = request.agent(app);
      const res = await agent
        .post('/api/users/login')
        .send({ email: loginEmail, password, role: 'investor' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: userId, role: 'investor', name: 'Test Investor' });

      const me = await agent.get('/api/users/me');
      expect(me.status).toBe(200);
      expect(me.body).toEqual({ id: userId, role: 'investor', name: 'Test Investor' });
    });

    it('gives the same 401 for a wrong password and an unknown email', async () => {
      const wrongPassword = await login({
        email: loginEmail,
        password: 'wrong-password',
        role: 'investor',
      });
      const unknownEmail = await login({ email: emailFor('nobody'), password, role: 'investor' });
      for (const res of [wrongPassword, unknownEmail]) {
        expect(res.status).toBe(401);
        expect(res.body.error.message).toBe('Invalid credentials');
      }
    });

    it('refuses the wrong workspace (403)', async () => {
      const res = await login({ email: loginEmail, password, role: 'company' });
      expect(res.status).toBe(403);
      expect(res.body.error.message).toBe('This account is not a company account');
    });

    it('refuses a suspended account (403)', async () => {
      await prisma.user.update({ where: { id: userId }, data: { status: 'suspended' } });
      const res = await login({ email: loginEmail, password, role: 'investor' });
      expect(res.status).toBe(403);
      expect(res.body.error.message).toBe('This account is suspended');
    });
  });

  describe('GET /me and POST /logout', () => {
    it('/me needs a login (401)', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('logout clears the cookie, and /me is 401 afterwards', async () => {
      const agent = request.agent(app);
      await agent.post('/api/users/register').send({ ...investorBody, email: emailFor('logout') });

      const out = await agent.post('/api/users/logout');
      expect(out.status).toBe(204);
      expect(String(out.headers['set-cookie'])).toContain('plantrust_session=;');

      const me = await agent.get('/api/users/me');
      expect(me.status).toBe(401);
    });
  });

  describe('userService', () => {
    it('getById returns a real user as a summary', async () => {
      const res = await register({ ...investorBody, email: emailFor('service') });
      const summary = await userService.getById(res.body.id);
      expect(summary).toEqual({
        id: res.body.id,
        role: 'investor',
        name: 'Test Investor',
        verified: true,
      });
    });

    it('getById returns null for an unknown id', async () => {
      expect(await userService.getById(`no-such-user-${run}`)).toBeNull();
    });

    it('getVerified lets every existing user through until Sprint 3', async () => {
      const res = await register({ ...investorBody, email: emailFor('verified') });
      expect(await userService.getVerified(res.body.id)).not.toBeNull();
      expect(await userService.getVerified(`no-such-user-${run}`)).toBeNull();
    });
  });
});
