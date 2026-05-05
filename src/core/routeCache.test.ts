import {
  setCache,
  getCache,
  removeCache,
  getAllCachePolicies,
  clearAllCachePolicies,
  isCacheEnabled,
  getCacheHeaders,
  makeKey,
} from './routeCache';

beforeEach(() => {
  clearAllCachePolicies();
});

describe('makeKey', () => {
  it('normalises method to uppercase', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setCache / getCache', () => {
  it('stores and retrieves a cache policy', () => {
    setCache('GET', '/users', { ttl: 60 });
    expect(getCache('GET', '/users')).toEqual({ ttl: 60 });
  });

  it('returns undefined for unknown route', () => {
    expect(getCache('GET', '/unknown')).toBeUndefined();
  });

  it('stores varyBy and tags', () => {
    setCache('GET', '/items', { ttl: 120, varyBy: ['Accept'], tags: ['items'] });
    expect(getCache('GET', '/items')).toMatchObject({ varyBy: ['Accept'], tags: ['items'] });
  });
});

describe('removeCache', () => {
  it('removes an existing policy', () => {
    setCache('GET', '/users', { ttl: 30 });
    expect(removeCache('GET', '/users')).toBe(true);
    expect(getCache('GET', '/users')).toBeUndefined();
  });

  it('returns false when policy does not exist', () => {
    expect(removeCache('GET', '/nope')).toBe(false);
  });
});

describe('getAllCachePolicies', () => {
  it('returns all stored policies', () => {
    setCache('GET', '/a', { ttl: 10 });
    setCache('POST', '/b', { ttl: 20 });
    const all = getAllCachePolicies();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toEqual({ ttl: 10 });
  });
});

describe('isCacheEnabled', () => {
  it('returns true when policy exists and noStore is not set', () => {
    setCache('GET', '/users', { ttl: 60 });
    expect(isCacheEnabled('GET', '/users')).toBe(true);
  });

  it('returns false when noStore is true', () => {
    setCache('GET', '/users', { ttl: 0, noStore: true });
    expect(isCacheEnabled('GET', '/users')).toBe(false);
  });

  it('returns false when no policy', () => {
    expect(isCacheEnabled('GET', '/missing')).toBe(false);
  });
});

describe('getCacheHeaders', () => {
  it('returns no-store header when noStore is true', () => {
    setCache('GET', '/private', { ttl: 0, noStore: true });
    expect(getCacheHeaders('GET', '/private')).toEqual({ 'Cache-Control': 'no-store' });
  });

  it('returns max-age header', () => {
    setCache('GET', '/data', { ttl: 300 });
    expect(getCacheHeaders('GET', '/data')).toEqual({ 'Cache-Control': 'max-age=300' });
  });

  it('includes Vary header when varyBy is set', () => {
    setCache('GET', '/data', { ttl: 300, varyBy: ['Accept', 'Authorization'] });
    const headers = getCacheHeaders('GET', '/data');
    expect(headers['Vary']).toBe('Accept, Authorization');
  });

  it('returns no-store for unknown route', () => {
    expect(getCacheHeaders('GET', '/unknown')).toEqual({ 'Cache-Control': 'no-store' });
  });
});
