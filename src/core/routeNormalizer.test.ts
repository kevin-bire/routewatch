import { normalizeRoute, normalizeRoutes, RouteNormalizationError } from './routeNormalizer';

describe('normalizeRoute', () => {
  it('should uppercase the HTTP method', () => {
    const result = normalizeRoute({ method: 'get', path: '/users' });
    expect(result.method).toBe('GET');
  });

  it('should default method to GET if not provided', () => {
    const result = normalizeRoute({ path: '/users' });
    expect(result.method).toBe('GET');
  });

  it('should prepend slash to path if missing', () => {
    const result = normalizeRoute({ method: 'GET', path: 'users' });
    expect(result.path).toBe('/users');
  });

  it('should collapse duplicate slashes in path', () => {
    const result = normalizeRoute({ method: 'GET', path: '//users//posts' });
    expect(result.path).toBe('/users/posts');
  });

  it('should remove trailing slash from path', () => {
    const result = normalizeRoute({ method: 'GET', path: '/users/' });
    expect(result.path).toBe('/users');
  });

  it('should preserve root path /', () => {
    const result = normalizeRoute({ method: 'GET', path: '/' });
    expect(result.path).toBe('/');
  });

  it('should lowercase and trim tags', () => {
    const result = normalizeRoute({ method: 'GET', path: '/users', tags: ['  Users ', 'ADMIN'] });
    expect(result.tags).toEqual(['users', 'admin']);
  });

  it('should apply default tags when no tags are provided', () => {
    const result = normalizeRoute(
      { method: 'GET', path: '/users' },
      { defaultTags: ['default'] }
    );
    expect(result.tags).toEqual(['default']);
  });

  it('should trim summary and description', () => {
    const result = normalizeRoute({
      method: 'GET',
      path: '/users',
      summary: '  Get users  ',
      description: '  Returns all users  ',
    });
    expect(result.summary).toBe('Get users');
    expect(result.description).toBe('Returns all users');
  });

  it('should throw RouteNormalizationError in strict mode for invalid routes', () => {
    expect(() =>
      normalizeRoute({ method: 'INVALID', path: '/users' }, { strictValidation: true })
    ).toThrow(RouteNormalizationError);
  });

  it('should not throw in non-strict mode for invalid routes', () => {
    expect(() =>
      normalizeRoute({ method: 'INVALID', path: '/users' })
    ).not.toThrow();
  });
});

describe('normalizeRoutes', () => {
  it('should normalize an array of routes', () => {
    const routes = [
      { method: 'get', path: 'users/' },
      { method: 'post', path: '/users' },
    ];
    const results = normalizeRoutes(routes);
    expect(results[0].method).toBe('GET');
    expect(results[0].path).toBe('/users');
    expect(results[1].method).toBe('POST');
  });
});
