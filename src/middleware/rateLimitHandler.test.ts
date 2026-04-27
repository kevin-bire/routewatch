import express, { Express } from 'express';
import request from 'supertest';
import { registerRateLimitRoutes } from './rateLimitHandler';
import { clearRateLimits } from '../core/routeRateLimiter';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  registerRateLimitRoutes(app as any);
  return app;
}

beforeEach(() => {
  clearRateLimits();
});

describe('GET /routewatch/rate-limits', () => {
  it('returns empty object when no limits are set', async () => {
    const res = await request(buildApp()).get('/routewatch/rate-limits');
    expect(res.status).toBe(200);
    expect(res.body.rateLimits).toEqual({});
  });

  it('returns configured rate limits', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/rate-limits').send({
      method: 'GET',
      path: '/users',
      maxRequests: 100,
      windowMs: 60000,
    });
    const res = await request(app).get('/routewatch/rate-limits');
    expect(res.status).toBe(200);
    expect(res.body.rateLimits['GET:/users']).toBeDefined();
  });
});

describe('POST /routewatch/rate-limits', () => {
  it('creates a new rate limit', async () => {
    const res = await request(buildApp()).post('/routewatch/rate-limits').send({
      method: 'POST',
      path: '/items',
      maxRequests: 50,
      windowMs: 30000,
    });
    expect(res.status).toBe(201);
    expect(res.body.rateLimit.maxRequests).toBe(50);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(buildApp()).post('/routewatch/rate-limits').send({
      method: 'GET',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid maxRequests', async () => {
    const res = await request(buildApp()).post('/routewatch/rate-limits').send({
      method: 'GET',
      path: '/test',
      maxRequests: -1,
      windowMs: 1000,
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /routewatch/rate-limits', () => {
  it('removes an existing rate limit', async () => {
    const app = buildApp();
    await request(app).post('/routewatch/rate-limits').send({
      method: 'GET',
      path: '/users',
      maxRequests: 10,
      windowMs: 1000,
    });
    const res = await request(app)
      .delete('/routewatch/rate-limits')
      .query({ method: 'GET', path: '/users' });
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(true);
  });

  it('returns 400 when query params are missing', async () => {
    const res = await request(buildApp()).delete('/routewatch/rate-limits');
    expect(res.status).toBe(400);
  });
});
