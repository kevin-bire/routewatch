import { generateSpec, generateSpecJSON } from './specGenerator';
import { registerRoute, clearRoutes } from './routeCollector';
import { clearCache, invalidateCache } from './specCache';

describe('specGenerator', () => {
  beforeEach(() => {
    clearRoutes();
    clearCache();
  });

  it('returns a valid OpenAPI spec object', () => {
    registerRoute({ method: 'GET', path: '/health', summary: 'Health check' });
    const spec = generateSpec();

    expect(spec).toHaveProperty('openapi');
    expect(spec).toHaveProperty('info');
    expect(spec).toHaveProperty('paths');
  });

  it('uses default options when none provided', () => {
    const spec = generateSpec();

    expect(spec.info.title).toBe('API Documentation');
    expect(spec.info.version).toBe('1.0.0');
  });

  it('merges custom options into spec info', () => {
    const spec = generateSpec({ title: 'My API', version: '2.0.0', description: 'Test API' });

    expect(spec.info.title).toBe('My API');
    expect(spec.info.version).toBe('2.0.0');
    expect(spec.info.description).toBe('Test API');
  });

  it('returns cached spec when cache is not dirty', () => {
    registerRoute({ method: 'GET', path: '/users', summary: 'List users' });
    const first = generateSpec();

    registerRoute({ method: 'POST', path: '/users', summary: 'Create user' });
    // Cache not invalidated — should return stale spec
    const second = generateSpec();

    expect(first).toBe(second);
  });

  it('rebuilds spec when cache is invalidated', () => {
    registerRoute({ method: 'GET', path: '/users', summary: 'List users' });
    const first = generateSpec();

    invalidateCache();
    registerRoute({ method: 'POST', path: '/users', summary: 'Create user' });
    const second = generateSpec();

    expect(first).not.toBe(second);
  });

  it('generateSpecJSON returns a valid JSON string', () => {
    registerRoute({ method: 'GET', path: '/ping', summary: 'Ping' });
    const json = generateSpecJSON();

    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
