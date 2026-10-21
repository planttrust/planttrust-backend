const request = require('supertest');
const app = require('../server');

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
});

describe('Module 2 — Marketplace', () => {
  it('GET /api/escrow should return scaffolded message', async () => {
    const res = await request(app).get('/api/escrow');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('escrow');
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
});

describe('Module 5 — Blockchain', () => {
  it('GET /api/audit should return scaffolded message', async () => {
    const res = await request(app).get('/api/audit');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('audit');
  });

  it('GET /api/trust-index should return scaffolded message', async () => {
    const res = await request(app).get('/api/trust-index');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('trust-index');
  });

  it('GET /api/verify should return scaffolded message', async () => {
    const res = await request(app).get('/api/verify');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('verify');
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});
