import {
  setRouteEnvironments,
  getRouteEnvironments,
  isRouteInEnvironment,
  removeRouteEnvironments,
  getAllRouteEnvironments,
  filterRoutesByEnvironment,
  clearEnvironments,
} from './routeEnvironment';

beforeEach(() => {
  clearEnvironments();
});

describe('setRouteEnvironments / getRouteEnvironments', () => {
  it('stores and retrieves environments for a route', () => {
    setRouteEnvironments('GET', '/users', ['production', 'staging']);
    expect(getRouteEnvironments('GET', '/users')).toEqual(['production', 'staging']);
  });

  it('returns undefined for unknown route', () => {
    expect(getRouteEnvironments('GET', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive on method', () => {
    setRouteEnvironments('get', '/items', ['development']);
    expect(getRouteEnvironments('GET', '/items')).toEqual(['development']);
  });
});

describe('isRouteInEnvironment', () => {
  it('returns true when env is in the list', () => {
    setRouteEnvironments('POST', '/orders', ['production']);
    expect(isRouteInEnvironment('POST', '/orders', 'production')).toBe(true);
  });

  it('returns false when env is not in the list', () => {
    setRouteEnvironments('POST', '/orders', ['production']);
    expect(isRouteInEnvironment('POST', '/orders', 'development')).toBe(false);
  });

  it('returns true for routes with no environment restriction', () => {
    expect(isRouteInEnvironment('DELETE', '/no-restriction', 'staging')).toBe(true);
  });
});

describe('removeRouteEnvironments', () => {
  it('removes an existing entry and returns true', () => {
    setRouteEnvironments('GET', '/tmp', ['staging']);
    expect(removeRouteEnvironments('GET', '/tmp')).toBe(true);
    expect(getRouteEnvironments('GET', '/tmp')).toBeUndefined();
  });

  it('returns false when entry does not exist', () => {
    expect(removeRouteEnvironments('GET', '/nope')).toBe(false);
  });
});

describe('getAllRouteEnvironments', () => {
  it('returns all stored entries', () => {
    setRouteEnvironments('GET', '/a', ['production']);
    setRouteEnvironments('POST', '/b', ['staging', 'development']);
    const all = getAllRouteEnvironments();
    expect(all['GET:/a']).toEqual(['production']);
    expect(all['POST:/b']).toEqual(['staging', 'development']);
  });

  it('returns empty object when store is empty', () => {
    expect(getAllRouteEnvironments()).toEqual({});
  });
});

describe('filterRoutesByEnvironment', () => {
  it('filters routes not available in the given environment', () => {
    setRouteEnvironments('GET', '/prod-only', ['production']);
    const routes = [
      { method: 'GET', path: '/prod-only' },
      { method: 'GET', path: '/unrestricted' },
    ];
    const result = filterRoutesByEnvironment(routes, 'development');
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/unrestricted');
  });

  it('returns all routes when all match the environment', () => {
    setRouteEnvironments('GET', '/a', ['production']);
    const routes = [{ method: 'GET', path: '/a' }];
    expect(filterRoutesByEnvironment(routes, 'production')).toHaveLength(1);
  });
});
