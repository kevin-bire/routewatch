import { filterRoutes, groupRoutesByTag } from './routeFilter';
import { RouteDefinition } from './routeCollector';

const sampleRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/users', summary: 'List users', tags: ['users'] },
  { method: 'POST', path: '/users', summary: 'Create user', tags: ['users'] },
  { method: 'GET', path: '/users/:id', summary: 'Get user', tags: ['users'] },
  { method: 'DELETE', path: '/admin/users/:id', summary: 'Delete user', tags: ['admin'], internal: true },
  { method: 'GET', path: '/products', summary: 'List products', tags: ['products'] },
];

describe('filterRoutes', () => {
  it('filters by single method', () => {
    const result = filterRoutes(sampleRoutes, { method: 'GET' });
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.method === 'GET')).toBe(true);
  });

  it('filters by multiple methods', () => {
    const result = filterRoutes(sampleRoutes, { method: ['GET', 'POST'] });
    expect(result).toHaveLength(4);
  });

  it('filters by path prefix', () => {
    const result = filterRoutes(sampleRoutes, { pathPrefix: '/users' });
    expect(result).toHaveLength(3);
  });

  it('filters by tags', () => {
    const result = filterRoutes(sampleRoutes, { tags: ['admin'] });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/admin/users/:id');
  });

  it('excludes internal routes', () => {
    const result = filterRoutes(sampleRoutes, { excludeInternal: true });
    expect(result).toHaveLength(4);
    expect(result.find((r) => r.internal)).toBeUndefined();
  });

  it('combines multiple filters', () => {
    const result = filterRoutes(sampleRoutes, {
      method: 'GET',
      pathPrefix: '/users',
    });
    expect(result).toHaveLength(2);
  });

  it('returns all routes when no options provided', () => {
    const result = filterRoutes(sampleRoutes, {});
    expect(result).toHaveLength(sampleRoutes.length);
  });
});

describe('groupRoutesByTag', () => {
  it('groups routes by their tag', () => {
    const result = groupRoutesByTag(sampleRoutes);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['users', 'admin', 'products']));
    expect(result['users']).toHaveLength(3);
    expect(result['products']).toHaveLength(1);
  });

  it('falls back to path segment when no tags', () => {
    const routes: RouteDefinition[] = [
      { method: 'GET', path: '/orders', summary: 'List orders' },
    ];
    const result = groupRoutesByTag(routes);
    expect(result['orders']).toHaveLength(1);
  });
});
