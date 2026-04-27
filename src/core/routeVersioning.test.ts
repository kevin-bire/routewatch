import {
  extractVersion,
  groupRoutesByVersion,
  getLatestVersion,
  markDeprecatedRoutes,
} from './routeVersioning';

describe('extractVersion', () => {
  it('extracts version from versioned path', () => {
    expect(extractVersion('/v1/users')).toBe('1');
    expect(extractVersion('/v2/orders')).toBe('2');
    expect(extractVersion('/v1.1/items')).toBe('1.1');
  });

  it('returns null for unversioned paths', () => {
    expect(extractVersion('/users')).toBeNull();
    expect(extractVersion('/api/health')).toBeNull();
  });
});

describe('groupRoutesByVersion', () => {
  const routes = [
    { path: '/v1/users', method: 'GET' },
    { path: '/v2/users', method: 'GET' },
    { path: '/v1/orders', method: 'POST' },
    { path: '/health', method: 'GET' },
  ];

  it('groups routes by version', () => {
    const grouped = groupRoutesByVersion(routes);
    expect(grouped.get('1')).toHaveLength(2);
    expect(grouped.get('2')).toHaveLength(1);
    expect(grouped.get('unversioned')).toHaveLength(1);
  });

  it('returns empty map for empty input', () => {
    expect(groupRoutesByVersion([]).size).toBe(0);
  });
});

describe('getLatestVersion', () => {
  it('returns the highest version', () => {
    expect(getLatestVersion(['1', '2', '3'])).toBe('3');
    expect(getLatestVersion(['1.1', '2.0', '1.5'])).toBe('2.0');
  });

  it('ignores unversioned', () => {
    expect(getLatestVersion(['unversioned', '1'])).toBe('1');
  });

  it('returns null when no numeric versions', () => {
    expect(getLatestVersion(['unversioned'])).toBeNull();
    expect(getLatestVersion([])).toBeNull();
  });
});

describe('markDeprecatedRoutes', () => {
  const routes = [
    { path: '/v1/users', method: 'GET' },
    { path: '/v2/users', method: 'GET' },
    { path: '/health', method: 'GET' },
  ];

  it('marks older versions as deprecated', () => {
    const result = markDeprecatedRoutes(routes, '2');
    expect(result[0].deprecated).toBe(true);
    expect((result[0] as any).deprecatedSince).toBe('v2');
    expect(result[1].deprecated).toBeUndefined();
    expect(result[2].deprecated).toBeUndefined();
  });
});
