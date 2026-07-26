import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('reports a healthy service when the database is reachable', async () => {
    const app = createApp({
      databaseHealthChecker: async () => undefined,
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Service is healthy.',
      data: {
        status: 'healthy',
        database: 'connected',
      },
    });
  });
});
