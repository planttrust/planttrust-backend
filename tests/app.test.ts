import request from 'supertest';
import app from '../src/server';
import db from '../src/shared/db';

describe('Health Check', () => {
  it('GET /health should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('planttrust-backend');
  });
});

describe('Module 1 — User Management', () => {
  it('GET /api/auth should return status message', async () => {
    const res = await request(app).get('/api/auth');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('auth');
  });

  it('POST /api/auth/register should validate required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('required');
  });

  it('POST /api/auth/login should validate required fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('email and password');
  });

  it('GET /api/documents should return scaffolded message', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('documents');
  });

  it('GET /api/certificates should return scaffolded message', async () => {
    const res = await request(app).get('/api/certificates');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('certificates');
  });

  it('GET /api/certificates/:id/verify should return honest scaffolded verification status', async () => {
    const res = await request(app).get('/api/certificates/cert-9876/verify');
    expect(res.statusCode).toBe(200);
    expect(res.body.certificateId).toBe('cert-9876');
    expect(res.body.verified).toBe(false);
    expect(res.body.status).toBe('UNVERIFIED_SCAFFOLD');
    expect(res.body.isMock).toBe(true);
  });
});

describe('Module 2 — Marketplace', () => {
  it('GET /api/escrow should return scaffolded message', async () => {
    const res = await request(app).get('/api/escrow');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('escrow');
  });

  it('POST /api/escrow/fund should transition CREATED -> FUNDED and return 201', async () => {
    const res = await request(app).post('/api/escrow/fund').send({
      projectId: 'proj-kurunegala-agri',
      investorId: '00000000-0000-0000-0000-000000000003',
      amount: 2500,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('FUNDED');
    expect(res.body.amount).toBe(2500);
    expect(res.body.isMock).toBe(true);
  });

  it('GET /api/escrow/:escrowId/history should return state transition history', async () => {
    const res = await request(app).get('/api/escrow/esc-001/history');
    expect(res.statusCode).toBe(200);
    expect(res.body.escrowId).toBe('esc-001');
    expect(Array.isArray(res.body.transitions)).toBe(true);
  });

  it('GET /api/listings should return scaffolded message', async () => {
    const res = await request(app).get('/api/listings');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('listings');
  });

  it('GET /api/transfers should return scaffolded message', async () => {
    const res = await request(app).get('/api/transfers');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('transfers');
  });
});

describe('Module 3 — MCP AI', () => {
  it('GET /api/mcp should return scaffolded message', async () => {
    const res = await request(app).get('/api/mcp');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('mcp');
  });

  it('POST /api/mcp/query should return JSON-RPC 2.0 scaffolded response', async () => {
    const res = await request(app).post('/api/mcp/query').send({
      method: 'verify_company_registration',
      params: { companyName: 'GreenAgri Plantations PLC' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.jsonrpc).toBe('2.0');
    expect(res.body.result.method).toBe('verify_company_registration');
    expect(res.body.result.isMock).toBe(true);
  });

  it('GET /api/chatbot should return scaffolded message', async () => {
    const res = await request(app).get('/api/chatbot');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('chatbot');
  });

  it('GET /api/scam should return scaffolded message', async () => {
    const res = await request(app).get('/api/scam');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('scam');
  });

  it('POST /api/scam/check should flag suspicious keywords against CBSL rules', async () => {
    const res = await request(app).post('/api/scam/check').send({
      text: 'Invest today for guaranteed returns and double your money with 100% profit!',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.overallRisk).toBe('high');
    expect(res.body.flags.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Module 4 — Geofencing', () => {
  it('GET /api/projects should return scaffolded message', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('projects');
  });

  it('GET /api/reports should return scaffolded message', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('reports');
  });

  it('GET /api/geofence should return scaffolded message', async () => {
    const res = await request(app).get('/api/geofence');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('geofence');
  });

  it('POST /api/geofence/check should evaluate ray-casting point-in-polygon', async () => {
    const res = await request(app).post('/api/geofence/check').send({
      polygon: [
        { latitude: 7.48, longitude: 80.35 },
        { latitude: 7.50, longitude: 80.35 },
        { latitude: 7.50, longitude: 80.38 },
        { latitude: 7.48, longitude: 80.38 },
      ],
      point: { latitude: 7.49, longitude: 80.36 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.isInside).toBe(true);
    expect(res.body.algorithm).toBe('ray-casting');
  });
});

describe('Module 5 — Blockchain & Contract Aliases', () => {
  it('GET /api/audit should return scaffolded message', async () => {
    const res = await request(app).get('/api/audit');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('audit');
  });

  it('POST /api/audit/anchor should queue valid SHA-256 event hash and return 201', async () => {
    const res = await request(app).post('/api/audit/anchor').send({
      sourceModule: 'module-1',
      eventType: 'CERTIFICATE_ISSUED',
      dataHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      metadata: { certificateId: 'cert-9876' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('queued');
    expect(res.body.anchorId).toBeDefined();
    expect(res.body.batchId).toBeDefined();
    expect(res.body.txHash).toBeNull();
  });

  it('POST /api/audit/anchor should reject invalid SHA-256 dataHash with 400', async () => {
    const res = await request(app).post('/api/audit/anchor').send({
      sourceModule: 'module-1',
      eventType: 'CERTIFICATE_ISSUED',
      dataHash: 'not-a-valid-sha256',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid dataHash format');
  });

  it('POST /api/audit/mint should queue XLS-20 NFT mint stub and return 201', async () => {
    const res = await request(app).post('/api/audit/mint').send({
      investorId: '00000000-0000-0000-0000-000000000003',
      projectId: 'proj-kurunegala-agri',
      amount: 1000,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('queued');
    expect(res.body.isMock).toBe(true);
  });

  it('GET /api/trust-index should return scaffolded message', async () => {
    const res = await request(app).get('/api/trust-index');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('trust-index');
  });

  it('GET /api/audit/trust-index should resolve via contract alias', async () => {
    const res = await request(app).get('/api/audit/trust-index');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('trust-index');
  });

  it('GET /api/audit/trust-index/:projectId should match contract schema with frontend component alignment', async () => {
    const res = await request(app).get('/api/audit/trust-index/proj-kurunegala-agri');
    expect(res.statusCode).toBe(200);
    expect(res.body.projectId).toBe('proj-kurunegala-agri');
    expect(res.body.isMock).toBe(true);
    expect(res.body.status).toBe('SCAFFOLD_MOCK');
    expect(res.body.score).toBeDefined();
    expect(res.body.trustScore).toBeDefined();
    expect(res.body.components).toHaveProperty('kycVerification');
    expect(res.body.components).toHaveProperty('escrowDiscipline');
    expect(res.body.components).toHaveProperty('milestoneReality');
    expect(res.body.components).toHaveProperty('complianceScore');
    expect(res.body.components).toHaveProperty('documentVerification');
    expect(res.body.components).toHaveProperty('escrowHealth');
    expect(res.body.components).toHaveProperty('geofencePassRate');
    expect(res.body.lastUpdated).toBeDefined();
  });

  it('GET /api/verify should return scaffolded message', async () => {
    const res = await request(app).get('/api/verify');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('verify');
  });

  it('GET /api/audit/verify should resolve via contract alias', async () => {
    const res = await request(app).get('/api/audit/verify');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('verify');
  });

  it('GET /api/audit/verify/:anchorId should return scaffolded mock and not falsely claim verified', async () => {
    const res = await request(app).get('/api/audit/verify/anc-7890');
    expect(res.statusCode).toBe(200);
    expect(res.body.anchorId).toBe('anc-7890');
    expect(res.body.isMock).toBe(true);
    expect(res.body.status).toBe('UNVERIFIED_SCAFFOLD');
    expect(res.body.verified).toBe(false);
    expect(res.body.dataHash).toBeDefined();
    expect(res.body.merkleRoot).toBeDefined();
    expect(Array.isArray(res.body.merkleProof)).toBe(true);
  });
});

describe('Configuration & Production Guards', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('should reject missing or default JWT_SECRET when NODE_ENV=production', () => {
    jest.isolateModules(() => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'dev-secret-change-in-prod';
      expect(() => require('../src/shared/config')).toThrow(/FATAL: JWT_SECRET/);
    });

    jest.isolateModules(() => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'change-this-to-a-random-secret';
      expect(() => require('../src/shared/config')).toThrow(/FATAL: JWT_SECRET/);
    });
  });

  it('should accept secure JWT_SECRET in production', () => {
    jest.isolateModules(() => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'strong-prod-secret-must-be-secure-32chars!';
      const cfg = require('../src/shared/config');
      expect(cfg.JWT_SECRET).toBe('strong-prod-secret-must-be-secure-32chars!');
    });
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

afterAll(async () => {
  await db.pool.end();
});
