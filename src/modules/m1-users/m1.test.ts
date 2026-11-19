import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { userService } from './m1.service';

describe('m1-users', () => {
  it('GET /api/users/health returns ok', async () => {
    const res = await request(createApp()).get('/api/users/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ module: 'm1-users', status: 'ok' });
  });

  it('userService.getVerified returns the user (stub)', async () => {
    const user = await userService.getVerified('user-1');
    expect(user?.id).toBe('user-1');
  });
});
