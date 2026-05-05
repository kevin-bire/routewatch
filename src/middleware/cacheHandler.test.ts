import express from 'express';
import request from 'supertest';
import {
  registerCacheRoutes,
  cacheHeadersMiddleware,
} from './cacheHandler';
import { clearAllCachePolicies, setCache } from '../core/routeCache';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cacheHeadersMiddleware);
  const router = express.Router();
  registerCacheRoutes(router);
  app.use(router);
  return app;
}

beforeEach(() => {
  clearAllCachePolicies();
});

describe('GET /__routewatch/cache', () => {
  it('returns empty object when no policies', async () => {
    const res = await request(buildApp()).get('/__routewatch/cache');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns all policies', async () => {
    setCache('GET', '/users', { ttl: 60 });
    const res = await request(buildApp()).get('/__routewatch/cache');
    expect(res.body['GET:/users']).toEqual({ ttl: 60 });
  });
});

describe('POST /__routewatch/cache/:method/*path', () => {
  it('sets a cache policy', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/cache/GET/users')
      .send({ ttl: 120, varyBy: ['Accept'] });
    expect(res.status).toBe(201);
    expect(res.body.policy.ttl).toBe(120);
  });

  it('returns 400 when ttl is missing', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/cache/GET/users')
      .send({ noStore: true });
    expect(res.status).toBe(400);
  });
});

describe('GET /__routewatch/cache/:method/*path', () => {
  it('returns 404 when policy not found', async () => {
    const res = await request(buildApp()).get('/__routewatch/cache/GET/unknown');
    expect(res.status).toBe(404);
  });

  it('returns policy when found', async () => {
    setCache('GET', '/products', { ttl: 30 });
    const res = await request(buildApp()).get('/__routewatch/cache/GET/products');
    expect(res.status).toBe(200);
    expect(res.body.ttl).toBe(30);
  });
});

describe('DELETE /__routewatch/cache/:method/*path', () => {
  it('removes an existing policy', async () => {
    setCache('GET', '/items', { ttl: 45 });
    const res = await request(buildApp()).delete('/__routewatch/cache/GET/items');
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent policy', async () => {
    const res = await request(buildApp()).delete('/__routewatch/cache/GET/nope');
    expect(res.status).toBe(404);
  });
});

describe('cacheHeadersMiddleware', () => {
  it('injects Cache-Control header for cached routes', async () => {
    setCache('GET', '/data', { ttl: 300 });
    const app = express();
    app.use(cacheHeadersMiddleware);
    app.get('/data', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/data');
    expect(res.headers['cache-control']).toBe('max-age=300');
  });
});
