import express, { Express } from 'express';
import request from 'supertest';
import {
  tracingMiddleware,
  registerTracingRoutes,
} from './tracingHandler';
import { clearTraces, recordTrace } from '../core/routeTracing';

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(tracingMiddleware);
  registerTracingRoutes(app as any);
  app.get('/hello', (_req, res) => res.json({ ok: true }));
  return app;
}

beforeEach(() => clearTraces());

describe('GET /routewatch/traces', () => {
  it('returns empty object initially', async () => {
    const res = await request(buildApp()).get('/routewatch/traces');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('returns traces after a request', async () => {
    const app = buildApp();
    await request(app).get('/hello');
    const res = await request(app).get('/routewatch/traces');
    expect(res.status).toBe(200);
    const keys = Object.keys(res.body);
    expect(keys.length).toBeGreaterThan(0);
  });
});

describe('GET /routewatch/traces/route', () => {
  it('returns 400 if params missing', async () => {
    const res = await request(buildApp()).get('/routewatch/traces/route');
    expect(res.status).toBe(400);
  });

  it('returns traces for a specific route', async () => {
    recordTrace({ traceId: 'x1', method: 'GET', path: '/hello', startedAt: 1, duration: 10, statusCode: 200 });
    const res = await request(buildApp()).get('/routewatch/traces/route?method=GET&path=/hello');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].traceId).toBe('x1');
  });
});

describe('DELETE /routewatch/traces', () => {
  it('clears all traces', async () => {
    recordTrace({ traceId: 'x1', method: 'GET', path: '/a', startedAt: 1 });
    const app = buildApp();
    const del = await request(app).delete('/routewatch/traces');
    expect(del.body.cleared).toBe(true);
    const res = await request(app).get('/routewatch/traces');
    expect(res.body).toEqual({});
  });
});
