import { groupByPrefix, groupByMethod, groupByTag, groupRoutes } from './routeGrouping';
import { RouteDefinition } from './routeCollector';

const sampleRoutes: RouteDefinition[] = [
  { method: 'GET',    path: '/users',          summary: 'List users',   tags: ['users'] },
  { method: 'POST',   path: '/users',          summary: 'Create user',  tags: ['users'] },
  { method: 'GET',    path: '/users/:id',      summary: 'Get user',     tags: ['users'] },
  { method: 'DELETE', path: '/users/:id',      summary: 'Delete user',  tags: ['users'] },
  { method: 'GET',    path: '/products',       summary: 'List products',tags: ['products'] },
  { method: 'POST',   path: '/products',       summary: 'Add product',  tags: ['products'] },
  { method: 'GET',    path: '/health',         summary: 'Health check', tags: [] },
];

describe('groupByPrefix', () => {
  it('groups routes by top-level path segment', () => {
    const groups = groupByPrefix(sampleRoutes);
    const keys = groups.map(g => g.key).sort();
    expect(keys).toEqual(['/health', '/products', '/users']);
  });

  it('puts all /users routes in the /users group', () => {
    const groups = groupByPrefix(sampleRoutes);
    const usersGroup = groups.find(g => g.key === '/users');
    expect(usersGroup).toBeDefined();
    expect(usersGroup!.routes).toHaveLength(4);
  });

  it('handles routes with only a root path', () => {
    const routes: RouteDefinition[] = [{ method: 'GET', path: '/', summary: 'Root' }];
    const groups = groupByPrefix(routes);
    expect(groups[0].key).toBe('/');
  });
});

describe('groupByMethod', () => {
  it('groups routes by HTTP method', () => {
    const groups = groupByMethod(sampleRoutes);
    const keys = groups.map(g => g.key).sort();
    expect(keys).toEqual(['DELETE', 'GET', 'POST']);
  });

  it('normalizes method to uppercase', () => {
    const routes: RouteDefinition[] = [{ method: 'get', path: '/foo', summary: 'Foo' }];
    const groups = groupByMethod(routes);
    expect(groups[0].key).toBe('GET');
  });

  it('counts GET routes correctly', () => {
    const groups = groupByMethod(sampleRoutes);
    const getGroup = groups.find(g => g.key === 'GET');
    expect(getGroup!.routes).toHaveLength(4);
  });
});

describe('groupByTag', () => {
  it('groups routes by first tag', () => {
    const groups = groupByTag(sampleRoutes);
    const keys = groups.map(g => g.key).sort();
    expect(keys).toEqual(['products', 'untagged', 'users']);
  });

  it('places routes without tags under "untagged"', () => {
    const groups = groupByTag(sampleRoutes);
    const untagged = groups.find(g => g.key === 'untagged');
    expect(untagged).toBeDefined();
    expect(untagged!.routes[0].path).toBe('/health');
  });
});

describe('groupRoutes', () => {
  it('accepts a custom key extractor', () => {
    const groups = groupRoutes(sampleRoutes, r => r.path.includes(':id') ? 'parameterized' : 'static');
    const keys = groups.map(g => g.key).sort();
    expect(keys).toEqual(['parameterized', 'static']);
  });

  it('returns empty array for empty input', () => {
    const groups = groupRoutes([], r => r.method);
    expect(groups).toHaveLength(0);
  });
});
