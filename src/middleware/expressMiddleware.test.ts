import express, { Application } from 'express';
import request from 'supertest';
import { routeWatchMiddleware, watch } from './expressMiddleware';
import { clearRoutes, registerRoute } from '../core/routeCollector';
import { clearCache } from '../core/specCache';

describe('expressMiddleware', () => {
  let app: Application;

  beforeEach(() => {
    clearRoutes();
    clearCache();
    app = express();
    app.use(routeWatchMiddleware({ title: 'Test API', version: '2.0.0' }));
  });

  describe('GET /api-docs', () => {
    it('should return HTML with swagger UI', async () => {
      const res = await request(app).get('/api-docs');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('swagger-ui');
      expect(res.text).toContain('Test API');
    });

    it('should include link to JSON spec', async () => {
      const res = await request(app).get('/api-docs');
      expect(res.text).toContain('/api-docs/json');
    });
  });

  describe('GET /api-docs/json', () => {
    it('should return valid JSON spec', async () => {
      registerRoute({ method: 'GET', path: '/users', summary: 'List users' });
      const res = await request(app).get('/api-docs/json');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
      const spec = JSON.parse(res.text);
      expect(spec.info.title).toBe('Test API');
      expect(spec.info.version).toBe('2.0.0');
    });

    it('should reflect registered routes in spec', async () => {
      registerRoute({ method: 'POST', path: '/items', summary: 'Create item' });
      const res = await request(app).get('/api-docs/json');
      const spec = JSON.parse(res.text);
      expect(spec.paths['/items']).toBeDefined();
      expect(spec.paths['/items']['post']).toBeDefined();
    });
  });

  describe('custom docsPath', () => {
    it('should serve docs at custom path', async () => {
      const customApp = express();
      customApp.use(routeWatchMiddleware({ docsPath: '/docs' }));
      const res = await request(customApp).get('/docs');
      expect(res.status).toBe(200);
    });
  });

  describe('watch middleware', () => {
    it('should register route and call next', async () => {
      app.get(
        '/test',
        watch({ method: 'GET', path: '/test', summary: 'Test route' }),
        (_req, res) => res.json({ ok: true })
      );
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      const specRes = await request(app).get('/api-docs/json');
      const spec = JSON.parse(specRes.text);
      expect(spec.paths['/test']).toBeDefined();
    });
  });
});
