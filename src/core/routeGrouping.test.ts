import { groupByPrefix, groupByMethod, groupByTag, groupRoutes } from './routeGrouping';
import { RouteDefinition } from './routeCollector';

const sampleRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/users', tags: ['users'], summary: 'List users' },
  { method: 'POST', path: '/users', tags: ['users'], summary: 'Create user' },
  { method: 'GET', path: '/users/:id', tags: ['users'], summary: 'Get user' },
  { method: 'DELETE', path: '/users/:id', tags: ['users', 'admin'], summary: 'Delete user' },
  { method: 'GET', path: '/posts', tags: ['posts'], summary: 'List posts' },
  { method: 'POST', path: '/posts', tags: ['posts'], summary: 'Create post' },
  { method: 'GET', path: '/health', tags: [], summary: 'Health check' },
];

describe('groupByPrefix', () => {
  it('groups routes by top-level path prefix', () => {
    const result = groupByPrefix(sampleRoutes);
    expect(Object.keys(result)).toContain('/users');
    expect(Object.keys(result)).toContain('/posts');
    expect(Object.keys(result)).toContain('/health');
    expect(result['/users']).toHaveLength(3);
    expect(result['/posts']).toHaveLength(2);
    expect(result['/health']).toHaveLength(1);
  });

  it('handles routes with no prefix gracefully', () => {
    const result = groupByPrefix([{ method: 'GET', path: '/', tags: [], summary: '' }]);
    expect(result['/']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByPrefix([])).toEqual({});
  });
});

describe('groupByMethod', () => {
  it('groups routes by HTTP method', () => {
    const result = groupByMethod(sampleRoutes);
    expect(result['GET']).toHaveLength(4);
    expect(result['POST']).toHaveLength(2);
    expect(result['DELETE']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByMethod([])).toEqual({});
  });

  it('normalizes method to uppercase', () => {
    const routes: RouteDefinition[] = [{ method: 'get' as any, path: '/test', tags: [], summary: '' }];
    const result = groupByMethod(routes);
    expect(result['GET']).toHaveLength(1);
  });
});

describe('groupByTag', () => {
  it('groups routes by tag', () => {
    const result = groupByTag(sampleRoutes);
    expect(result['users']).toHaveLength(4);
    expect(result['posts']).toHaveLength(2);
    expect(result['admin']).toHaveLength(1);
  });

  it('places untagged routes under "untagged" key', () => {
    const result = groupByTag(sampleRoutes);
    expect(result['untagged']).toHaveLength(1);
    expect(result['untagged'][0].path).toBe('/health');
  });

  it('returns empty object for empty input', () => {
    expect(groupByTag([])).toEqual({});
  });
});

describe('groupRoutes', () => {
  it('groups by prefix when strategy is "prefix"', () => {
    const result = groupRoutes(sampleRoutes, 'prefix');
    expect(result['/users']).toBeDefined();
  });

  it('groups by method when strategy is "method"', () => {
    const result = groupRoutes(sampleRoutes, 'method');
    expect(result['GET']).toBeDefined();
  });

  it('groups by tag when strategy is "tag"', () => {
    const result = groupRoutes(sampleRoutes, 'tag');
    expect(result['users']).toBeDefined();
  });

  it('defaults to prefix grouping for unknown strategy', () => {
    const result = groupRoutes(sampleRoutes, 'unknown' as any);
    expect(result['/users']).toBeDefined();
  });
});
