import { buildOpenAPISpec, RouteSchema } from './schemaBuilder';

const info = { title: 'Test API', version: '1.0.0' };

describe('buildOpenAPISpec', () => {
  it('returns a valid OpenAPI 3.0.3 structure', () => {
    const spec = buildOpenAPISpec([], info);
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info).toEqual(info);
    expect(spec.paths).toEqual({});
  });

  it('converts Express-style path params to OpenAPI format', () => {
    const routes: RouteSchema[] = [
      { method: 'get', path: '/users/:id', summary: 'Get user' },
    ];
    const spec = buildOpenAPISpec(routes, info);
    expect(spec.paths['/users/{id}']).toBeDefined();
    expect(spec.paths['/users/:id']).toBeUndefined();
  });

  it('converts multiple Express-style path params in the same path', () => {
    const routes: RouteSchema[] = [
      { method: 'get', path: '/orgs/:orgId/users/:userId', summary: 'Get org user' },
    ];
    const spec = buildOpenAPISpec(routes, info);
    expect(spec.paths['/orgs/{orgId}/users/{userId}']).toBeDefined();
    expect(spec.paths['/orgs/:orgId/users/:userId']).toBeUndefined();
  });

  it('places operation under the correct HTTP method key', () => {
    const routes: RouteSchema[] = [
      { method: 'post', path: '/items', summary: 'Create item' },
    ];
    const spec = buildOpenAPISpec(routes, info);
    expect(spec.paths['/items']['post']).toBeDefined();
  });

  it('maps non-body params to parameters array', () => {
    const routes: RouteSchema[] = [
      {
        method: 'get',
        path: '/search',
        params: [{ name: 'q', in: 'query', required: false, type: 'string' }],
      },
    ];
    const spec = buildOpenAPISpec(routes, info);
    const op = spec.paths['/search']['get'] as Record<string, unknown>;
    expect(Array.isArray(op.parameters)).toBe(true);
    expect((op.parameters as unknown[]).length).toBe(1);
  });

  it('attaches requestBody when provided', () => {
    const routes: RouteSchema[] = [
      {
        method: 'post',
        path: '/data',
        requestBody: { type: 'object', properties: { name: { type: 'string' } } },
      },
    ];
    const spec = buildOpenAPISpec(routes, info);
    const op = spec.paths['/data']['post'] as Record<string, unknown>;
    expect(op.requestBody).toBeDefined();
  });

  it('uses default 200 response when none specified', () => {
    const routes: RouteSchema[] = [{ method: 'get', path: '/ping' }];
    const spec = buildOpenAPISpec(routes, info);
    const op = spec.paths['/ping']['get'] as Record<string, unknown>;
    expect((op.responses as Record<number, unknown>)[200]).toBeDefined();
  });

  it('includes the summary in the operation when provided', () => {
    const routes: RouteSchema[] = [
      { method: 'get', path: '/hello', summary: 'Say hello' },
    ];
    const spec = buildOpenAPISpec(routes, info);
    const op = spec.paths['/hello']['get'] as Record<string, unknown>;
    expect(op.summary).toBe('Say hello');
  });

  it('omits summary from the operation when not provided', () => {
    const routes: RouteSchema[] = [
      { method: 'get', path: '/silent' },
    ];
    const spec = buildOpenAPISpec(routes, info);
    const op = spec.paths['/silent']['get'] as Record<string, unknown>;
    expect(op.summary).toBeUndefined();
  });
});
