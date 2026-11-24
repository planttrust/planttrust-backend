import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';
import { signToken } from '../../shared/auth';
import { prisma } from '../../shared/prisma';
import { userService } from '../m1-users/m1.service';
import { auditService } from '../m5-audit/m5.service';
import { projectService } from './m4.service';

const app = createApp();

// Unique ids per run, so tests never clash with seed data or each other.
const companyA = `test-m4-company-a-${randomUUID()}`;
const companyB = `test-m4-company-b-${randomUUID()}`;
const tokenA = signToken({ id: companyA, role: 'company' });
const tokenB = signToken({ id: companyB, role: 'company' });
const investorToken = signToken({ id: `test-m4-investor-${randomUUID()}`, role: 'investor' });

// About 1.1 km × 1.1 km near Kandy.
const boundary = [
  { lat: 7.29, lng: 80.63 },
  { lat: 7.29, lng: 80.64 },
  { lat: 7.3, lng: 80.64 },
  { lat: 7.3, lng: 80.63 },
  { lat: 7.29, lng: 80.63 },
];

const validBody = {
  title: 'Hantana tea restoration',
  description: 'Replanting a hill-country tea estate.',
  cropType: 'Tea',
  location: 'Hantana',
  district: 'Kandy',
  boundary,
  documents: [{ name: 'Land deed', url: 'https://example.com/deed.pdf' }],
  fundingGoal: 12_000_000,
  expectedReturnPct: 12.5,
  durationMonths: 36,
  milestones: [{ title: 'Land clearing', targetDate: '2027-03-31' }],
  risks: 'Monsoon delays',
};

const register = (token: string, body: object = validBody) =>
  request(app).post('/api/geofencing/projects').set('Authorization', `Bearer ${token}`).send(body);

afterAll(async () => {
  await prisma.project.deleteMany({ where: { companyId: { in: [companyA, companyB] } } });
  await prisma.$disconnect();
});

describe('m4-geofencing', () => {
  it('GET /api/geofencing/health returns ok', async () => {
    const res = await request(app).get('/api/geofencing/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm4-geofencing', status: 'ok' });
  });

  describe('POST /projects', () => {
    it('needs a login (401)', async () => {
      const res = await request(app).post('/api/geofencing/projects').send(validBody);
      expect(res.status).toBe(401);
    });

    it('is for companies only (403)', async () => {
      expect((await register(investorToken)).status).toBe(403);
    });

    it('refuses a company that is not verified (403)', async () => {
      vi.spyOn(userService, 'getVerified').mockResolvedValueOnce(null);
      expect((await register(tokenA)).status).toBe(403);
    });

    it('rejects a boundary that is not closed (400)', async () => {
      const res = await register(tokenA, { ...validBody, boundary: boundary.slice(0, -1) });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a boundary with fewer than 3 points (400)', async () => {
      const res = await register(tokenA, {
        ...validBody,
        boundary: [boundary[0], boundary[1], boundary[0]],
      });
      expect(res.status).toBe(400);
    });

    it('rejects an invalid latitude (400)', async () => {
      const bad = boundary.map((p, i) => (i === 1 ? { lat: 95, lng: p.lng } : p));
      expect((await register(tokenA, { ...validBody, boundary: bad })).status).toBe(400);
    });

    it('rejects an unknown district and a missing title (400)', async () => {
      expect((await register(tokenA, { ...validBody, district: 'Atlantis' })).status).toBe(400);
      expect((await register(tokenA, { ...validBody, title: undefined })).status).toBe(400);
    });

    it('saves the project and its land, and anchors PROJECT_REGISTERED with hashes only', async () => {
      const anchor = vi.spyOn(auditService, 'anchor');
      const res = await register(tokenA);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        companyId: companyA,
        title: validBody.title,
        district: 'Kandy',
        fundingGoal: 12_000_000,
        expectedReturnPct: 12.5,
        status: 'open',
        boundary,
      });
      expect(res.body.areaHectares).toBeGreaterThan(121);
      expect(res.body.centroid.lat).toBeCloseTo(7.295, 5);
      expect(res.body.anchorId).toMatch(/\S+/);

      expect(anchor).toHaveBeenCalledOnce();
      const [type, refId, data] = anchor.mock.calls[0];
      expect(type).toBe('PROJECT_REGISTERED');
      expect(refId).toBe(res.body.id);
      expect(data).toEqual({
        projectId: res.body.id,
        companyId: companyA,
        polygonHash: expect.stringMatching(/^[0-9a-f]{64}$/),
        areaHectares: res.body.areaHectares,
        fundingGoal: 12_000_000,
        documentHashes: [expect.stringMatching(/^[0-9a-f]{64}$/)],
        registeredAt: res.body.createdAt,
      });
      expect(JSON.stringify(data)).not.toContain('80.63'); // no raw coordinates
    });

    it('still saves the project if anchoring fails', async () => {
      vi.spyOn(auditService, 'anchor').mockRejectedValueOnce(new Error('M5 down'));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = await register(tokenA, { ...validBody, title: 'Saved without anchor' });
      expect(res.status).toBe(201);
      expect(res.body.anchorId).toBeNull();
    });
  });

  describe('GET /projects/mine', () => {
    it('lists only the logged-in company’s projects', async () => {
      await register(tokenB, { ...validBody, title: 'Company B project', status: 'draft' });

      const a = await request(app)
        .get('/api/geofencing/projects/mine')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(a.status).toBe(200);
      expect(a.body.length).toBeGreaterThanOrEqual(2);
      expect(a.body.every((p: { companyId: string }) => p.companyId === companyA)).toBe(true);

      const b = await request(app)
        .get('/api/geofencing/projects/mine')
        .set('Authorization', `Bearer ${tokenB}`);
      expect(b.body).toHaveLength(1);
      expect(b.body[0]).toMatchObject({ title: 'Company B project', status: 'draft' });
    });

    it('is for companies only (403)', async () => {
      const res = await request(app)
        .get('/api/geofencing/projects/mine')
        .set('Authorization', `Bearer ${investorToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('projectService (for M2 / M3)', () => {
    it('listOpen returns open projects but not drafts', async () => {
      const open = await projectService.listOpen();
      expect(open.some((p) => p.companyId === companyA)).toBe(true);
      expect(open.some((p) => p.companyId === companyB)).toBe(false);
      expect(Object.keys(open[0]).sort()).toEqual(
        ['companyId', 'fundingGoal', 'id', 'location', 'status', 'title'].sort(),
      );
    });

    it('getById returns a saved project, and null for an unknown id', async () => {
      const [mine] = await projectService.listOpen();
      expect(await projectService.getById(mine.id)).toEqual(mine);
      expect(await projectService.getById(randomUUID())).toBeNull();
    });
  });

  describe('POST /check', () => {
    const check = (body: object, token = investorToken) =>
      request(app).post('/api/geofencing/check').set('Authorization', `Bearer ${token}`).send(body);

    it('says whether a point is inside the project land', async () => {
      const { body: project } = await register(tokenA, { ...validBody, title: 'Check me' });
      const inside = await check({ projectId: project.id, lat: 7.295, lng: 80.635 });
      expect(inside.status).toBe(200);
      expect(inside.body).toEqual({ projectId: project.id, inside: true });

      const outside = await check({ projectId: project.id, lat: 6.9271, lng: 79.8612 });
      expect(outside.body).toEqual({ projectId: project.id, inside: false });
    });

    it('returns 404 for an unknown project and 400 for bad coordinates', async () => {
      expect((await check({ projectId: randomUUID(), lat: 7, lng: 80 })).status).toBe(404);
      expect((await check({ projectId: 'x', lat: 200, lng: 80 })).status).toBe(400);
    });

    it('needs a login (401)', async () => {
      const res = await request(app).post('/api/geofencing/check').send({});
      expect(res.status).toBe(401);
    });
  });
});
