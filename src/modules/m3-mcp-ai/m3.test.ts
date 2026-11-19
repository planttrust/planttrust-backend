import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { scamService } from './m3.service';

describe('m3-mcp-ai', () => {
  it('GET /api/mcp-ai/health returns ok', async () => {
    const res = await request(createApp()).get('/api/mcp-ai/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm3-mcp-ai', status: 'ok' });
  });

  it('scamService.riskCheck returns a risk level (stub)', async () => {
    const result = await scamService.riskCheck('project-1');
    expect(['low', 'medium', 'high']).toContain(result.level);
  });
});
