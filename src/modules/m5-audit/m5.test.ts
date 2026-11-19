import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { auditService } from './m5.service';

describe('m5-audit', () => {
  it('GET /api/audit/health returns ok', async () => {
    const res = await request(createApp()).get('/api/audit/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm5-audit', status: 'ok' });
  });

  it('auditService.anchor returns a SHA-256 hash (stub)', async () => {
    const receipt = await auditService.anchor('PROJECT_REGISTERED', 'project-1', { name: 'Demo' });
    expect(receipt.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.status).toBe('pending');
  });
});
