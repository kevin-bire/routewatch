import {
  setRouteAuth,
  getRouteAuth,
  removeRouteAuth,
  getAllRouteAuths,
  hasAuth,
  clearAuthRegistry,
  applyDefaultAuth,
} from './routeAuth';

beforeEach(() => {
  clearAuthRegistry();
});

describe('setRouteAuth / getRouteAuth', () => {
  it('stores and retrieves auth config for a route', () => {
    setRouteAuth('GET', '/users', { scheme: 'bearer', description: 'JWT token' });
    const auth = getRouteAuth('GET', '/users');
    expect(auth).toEqual({ scheme: 'bearer', description: 'JWT token' });
  });

  it('is case-insensitive for method', () => {
    setRouteAuth('get', '/items', { scheme: 'apiKey' });
    expect(getRouteAuth('GET', '/items')).toEqual({ scheme: 'apiKey' });
  });

  it('returns undefined for unknown route', () => {
    expect(getRouteAuth('POST', '/unknown')).toBeUndefined();
  });
});

describe('removeRouteAuth', () => {
  it('removes an existing auth entry', () => {
    setRouteAuth('DELETE', '/resource', { scheme: 'basic' });
    expect(removeRouteAuth('DELETE', '/resource')).toBe(true);
    expect(getRouteAuth('DELETE', '/resource')).toBeUndefined();
  });

  it('returns false when entry does not exist', () => {
    expect(removeRouteAuth('GET', '/nonexistent')).toBe(false);
  });
});

describe('hasAuth', () => {
  it('returns true when auth is set', () => {
    setRouteAuth('POST', '/login', { scheme: 'none' });
    expect(hasAuth('POST', '/login')).toBe(true);
  });

  it('returns false when auth is not set', () => {
    expect(hasAuth('GET', '/missing')).toBe(false);
  });
});

describe('getAllRouteAuths', () => {
  it('returns all registered auth entries', () => {
    setRouteAuth('GET', '/a', { scheme: 'bearer' });
    setRouteAuth('POST', '/b', { scheme: 'apiKey', scopes: ['write'] });
    const all = getAllRouteAuths();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.path)).toEqual(expect.arrayContaining(['/a', '/b']));
  });
});

describe('applyDefaultAuth', () => {
  it('upgrades none-scheme routes to the default scheme', () => {
    setRouteAuth('GET', '/public', { scheme: 'none' });
    setRouteAuth('GET', '/private', { scheme: 'bearer' });
    applyDefaultAuth('apiKey', 'API key required');
    expect(getRouteAuth('GET', '/public')?.scheme).toBe('apiKey');
    expect(getRouteAuth('GET', '/private')?.scheme).toBe('bearer');
  });
});
