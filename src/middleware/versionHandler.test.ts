import express from 'express';
import request from 'supertest';
import { registerRoute, clearRoutes } from '../core/routeCollector';
import { registerVersionRoutes } from './versionHandler';

function buildApp() {
  const app = express();
  const router = express.Router();
  registerVersionRoutes(router);
  app.use(router);
  return app;
}

beforeEach(() => {
  clearRoutes();
});

describe('GET /__routewatch/versions', () => {
  it('returns empty versions when no routes registered', async () => {
    const res = await request(buildApp()).get('/__routewatch/versions');
    expect(res.status).toBe(200);
    expect(res.body.latestVersion).toBeNull();
    expect(res.body.unversionedCount).toBe(0);
  });

  it('lists versioned routes with latest flag', async () => {
    registerRoute({ path: '/v1/users', method: 'GET', summary: 'List users v1' });
    registerRoute({ path: '/v2/users', method: 'GET', summary: 'List users v2' });
    registerRoute({ path: '/health', method: 'GET', summary: 'Health check' });

    const res = await request(buildApp()).get('/__routewatch/versions');
    expect(res.status).toBe(200);
    expect(res.body.latestVersion).toBe('v2');
    expect(res.body.versions['v1'].count).toBe(1);
    expect(res.body.versions['v1'].latest).toBe(false);
    expect(res.body.versions['v2'].latest).toBe(true);
    expect(res.body.unversionedCount).toBe(1);
  });
});

describe('GET /__routewatch/deprecated', () => {
  it('returns empty deprecated list when no routes', async () => {
    const res = await request(buildApp()).get('/__routewatch/deprecated');
    expect(res.status).toBe(200);
    expect(res.body.deprecated).toEqual([]);
  });

  it('marks older versioned routes as deprecated', async () => {
    registerRoute({ path: '/v1/users', method: 'GET', summary: 'List users v1' });
    registerRoute({ path: '/v2/users', method: 'GET', summary: 'List users v2' });

    const res = await request(buildApp()).get('/__routewatch/deprecated');
    expect(res.status).toBe(200);
    expect(res.body.deprecated).toHaveLength(1);
    expect(res.body.deprecated[0].path).toBe('/v1/users');
    expect(res.body.latestVersion).toBe('v2');
  });
});
