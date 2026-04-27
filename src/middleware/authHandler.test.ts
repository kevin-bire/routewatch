import express, { Express } from 'express';
import request from 'supertest';
import { registerAuthRoutes } from './authHandler';
import { clearAuthRegistry, setRouteAuth } from '../core/routeAuth';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  const router = express.Router();
  registerAuthRoutes(router);
  app.use(router);
  return app;
}

beforeEach(() => {
  clearAuthRegistry();
});

describe('GET /__routewatch/auth', () => {
  it('returns empty list when no auths registered', async () => {
    const res = await request(buildApp()).get('/__routewatch/auth');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.routes).toEqual([]);
  });

  it('returns all registered auth entries', async () => {
    setRouteAuth('GET', '/users', { scheme: 'bearer' });
    const res = await request(buildApp()).get('/__routewatch/auth');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });
});

describe('GET /__routewatch/auth/lookup', () => {
  it('returns 400 when query params missing', async () => {
    const res = await request(buildApp()).get('/__routewatch/auth/lookup');
    expect(res.status).toBe(400);
  });

  it('returns 404 when route not found', async () => {
    const res = await request(buildApp()).get('/__routewatch/auth/lookup?method=GET&path=/nope');
    expect(res.status).toBe(404);
  });

  it('returns auth config for known route', async () => {
    setRouteAuth('POST', '/login', { scheme: 'none' });
    const res = await request(buildApp()).get('/__routewatch/auth/lookup?method=POST&path=/login');
    expect(res.status).toBe(200);
    expect(res.body.auth.scheme).toBe('none');
  });
});

describe('POST /__routewatch/auth', () => {
  it('sets auth config for a route', async () => {
    const res = await request(buildApp())
      .post('/__routewatch/auth')
      .send({ method: 'GET', path: '/secure', auth: { scheme: 'bearer', description: 'JWT' } });
    expect(res.status).toBe(201);
    expect(res.body.auth.scheme).toBe('bearer');
  });

  it('returns 400 when body is incomplete', async () => {
    const res = await request(buildApp()).post('/__routewatch/auth').send({ method: 'GET' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /__routewatch/auth', () => {
  it('removes an existing auth entry', async () => {
    setRouteAuth('DELETE', '/item', { scheme: 'apiKey' });
    const res = await request(buildApp())
      .delete('/__routewatch/auth')
      .send({ method: 'DELETE', path: '/item' });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/removed/i);
  });

  it('returns 404 when entry does not exist', async () => {
    const res = await request(buildApp())
      .delete('/__routewatch/auth')
      .send({ method: 'GET', path: '/ghost' });
    expect(res.status).toBe(404);
  });
});
