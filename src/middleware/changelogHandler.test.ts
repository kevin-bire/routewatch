import express from 'express';
import request from 'supertest';
import { registerChangelogRoutes } from './changelogHandler';
import { registerRoute, clearRoutes } from '../core/routeCollector';
import { clearChangelog, takeSnapshot, recordChanges } from '../core/routeChangelog';

function buildApp() {
  const app = express();
  const router = express.Router();
  registerChangelogRoutes(router);
  app.use(router);
  return app;
}

beforeEach(() => {
  clearRoutes();
  clearChangelog();
});

describe('GET /_routewatch/changelog', () => {
  it('returns empty changelog initially', async () => {
    const app = buildApp();
    const res = await request(app).get('/_routewatch/changelog');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.entries).toEqual([]);
  });

  it('returns recorded changelog entries', async () => {
    registerRoute({ method: 'GET', path: '/items', summary: 'List items', tags: [] });
    takeSnapshot([]);
    recordChanges([{ method: 'GET', path: '/items', summary: 'List items', tags: [] }]);
    const app = buildApp();
    const res = await request(app).get('/_routewatch/changelog');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.entries[0].changeType).toBe('added');
  });
});

describe('POST /_routewatch/changelog/snapshot', () => {
  it('takes a snapshot and returns change count', async () => {
    registerRoute({ method: 'POST', path: '/orders', summary: 'Create order', tags: [] });
    const app = buildApp();
    const res = await request(app).post('/_routewatch/changelog/snapshot');
    expect(res.status).toBe(200);
    expect(res.body.snapshotTaken).toBe(true);
    expect(typeof res.body.changesDetected).toBe('number');
  });

  it('detects new routes added after last snapshot', async () => {
    const app = buildApp();
    registerRoute({ method: 'DELETE', path: '/items/:id', summary: 'Delete item', tags: [] });
    const res = await request(app).post('/_routewatch/changelog/snapshot');
    expect(res.status).toBe(200);
    expect(res.body.changesDetected).toBeGreaterThan(0);
  });
});
