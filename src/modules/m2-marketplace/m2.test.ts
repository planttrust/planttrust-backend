import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { escrowService } from './m2.service';

describe('m2-marketplace', () => {
  it('GET /api/marketplace/health returns ok', async () => {
    const res = await request(createApp()).get('/api/marketplace/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm2-marketplace', status: 'ok' });
  });

  it('escrowService.release returns a result for the project and report (stub)', async () => {
    const result = await escrowService.release('project-1', 'report-1');
    expect(result).toMatchObject({ projectId: 'project-1', reportId: 'report-1' });
  });
});
