import { validateRoute, validateRoutes } from './routeValidator';
import { RouteDefinition } from './routeCollector';

describe('validateRoute', () => {
  const validRoute: RouteDefinition = {
    method: 'GET',
    path: '/users',
    summary: 'Get all users',
    tags: ['users'],
  };

  it('should return valid for a correct route definition', () => {
    const result = validateRoute(validRoute);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when method is missing', () => {
    const result = validateRoute({ ...validRoute, method: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'method')).toBe(true);
  });

  it('should fail for an invalid HTTP method', () => {
    const result = validateRoute({ ...validRoute, method: 'FETCH' });
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Invalid HTTP method');
  });

  it('should accept all standard HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    for (const method of methods) {
      const result = validateRoute({ ...validRoute, method });
      expect(result.valid).toBe(true);
    }
  });

  it('should fail when path does not start with /', () => {
    const result = validateRoute({ ...validRoute, path: 'users' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'path')).toBe(true);
  });

  it('should fail for invalid path parameter format', () => {
    const result = validateRoute({ ...validRoute, path: '/users/:123invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Invalid path parameter format');
  });

  it('should pass for valid path parameters', () => {
    const result = validateRoute({ ...validRoute, path: '/users/:userId/posts/:postId' });
    expect(result.valid).toBe(true);
  });

  it('should fail when tags is not an array', () => {
    const result = validateRoute({ ...validRoute, tags: 'users' as any });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'tags')).toBe(true);
  });
});

describe('validateRoutes', () => {
  it('should return a map with results for each route', () => {
    const routes: RouteDefinition[] = [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
      { method: 'INVALID', path: 'no-slash' },
    ];
    const results = validateRoutes(routes);
    expect(results.size).toBe(3);
    expect(results.get('GET /users')?.valid).toBe(true);
    expect(results.get('INVALID no-slash')?.valid).toBe(false);
  });
});
