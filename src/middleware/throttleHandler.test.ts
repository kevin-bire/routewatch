import express, { Express } from 'express';
import request from 'supertest';
import { registerThrottleRoutes, throttleMiddleware } from './throttleHandler';
import { clearThrottles, setThrottle } from '../core/routeThrottle';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  registerThrottleRoutes(app as any);
  return app;
}

beforeEach(() => clearThrottles());

describe('GET /__routewatch/throttles', () => {
  it('returns empty object when no throttles set', async () => {
    const res = await request(buildApp()).get('/__routewatch/throttles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('lists all throttle policies', async () => {
    setThrottle('GET', '/api/users', { requestsPerWindow: 5, windowMs: 1000 });
    const res = await request(buildApp()).get('/__routewatch/throttles');
    expect(res.status).toBe(200);
    expect(res.body['GET:/api/users']).toBeDefined();
  });
});

describe('POST /__routewatch/throttles/:method/*path', () => {
  it('sets a throttle policy', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/throttles/GET/api/items')
      .send({ requestsPerWindow: 10, windowMs: 5000 });
    expect(res.status).toBe(201);
    expect(res.body.policy.requestsPerWindow).toBe(10);
  });

  it('returns 400 for invalid body', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/throttles/GET/api/items')
      .send({ requestsPerWindow: 10 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /__routewatch/throttles/:method/*path', () => {
  it('removes an existing throttle', async () => {
    setThrottle('POST', '/orders', { requestsPerWindow: 3, windowMs: 1000 });
    const res = await request(buildApp()).delete('/__routewatch/throttles/POST/orders');
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    const res = await request(buildApp()).delete('/__routewatch/throttles/GET/ghost');
    expect(res.status).toBe(404);
  });
});

describe('throttleMiddleware', () => {
  it('passes through when no policy exists', async () => {
    const app = express();
    app.use(throttleMiddleware);
    app.get('/free', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/free');
    expect(res.status).toBe(200);
  });

  it('returns 429 when limit exceeded', async () => {
    setThrottle('GET', '/limited', { requestsPerWindow: 1, windowMs: 10000 });
    const app = express();
    app.use(throttleMiddleware);
    app.get('/limited', (_req, res) => res.json({ ok: true }));
    await request(app).get('/limited');
    const res = await request(app).get('/limited');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Too Many Requests');
  });
});
