import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { projectService } from './m4.service';

describe('m4-geofencing', () => {
  it('GET /api/geofencing/health returns ok', async () => {
    const res = await request(createApp()).get('/api/geofencing/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm4-geofencing', status: 'ok' });
  });

  it('projectService.getById returns the project (stub)', async () => {
    const project = await projectService.getById('project-1');
    expect(project?.id).toBe('project-1');
  });
});
