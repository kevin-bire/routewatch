import {
  setRateLimit,
  getRateLimit,
  getAllRateLimits,
  removeRateLimit,
  clearRateLimits,
  isRateLimited,
  makeKey,
} from './routeRateLimiter';

beforeEach(() => {
  clearRateLimits();
});

describe('makeKey', () => {
  it('creates a key from method and path', () => {
    expect(makeKey('GET', '/users')).toBe('GET:/users');
    expect(makeKey('post', '/items')).toBe('POST:/items');
  });
});

describe('setRateLimit / getRateLimit', () => {
  it('stores and retrieves a rate limit config', () => {
    setRateLimit('GET', '/users', { maxRequests: 100, windowMs: 60000 });
    const limit = getRateLimit('GET', '/users');
    expect(limit).toBeDefined();
    expect(limit?.maxRequests).toBe(100);
    expect(limit?.windowMs).toBe(60000);
  });

  it('returns undefined for unknown route', () => {
    expect(getRateLimit('DELETE', '/unknown')).toBeUndefined();
  });

  it('overwrites existing limit', () => {
    setRateLimit('GET', '/users', { maxRequests: 50, windowMs: 30000 });
    setRateLimit('GET', '/users', { maxRequests: 200, windowMs: 60000 });
    expect(getRateLimit('GET', '/users')?.maxRequests).toBe(200);
  });
});

describe('getAllRateLimits', () => {
  it('returns all configured limits', () => {
    setRateLimit('GET', '/users', { maxRequests: 10, windowMs: 1000 });
    setRateLimit('POST', '/items', { maxRequests: 5, windowMs: 500 });
    const all = getAllRateLimits();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe('removeRateLimit', () => {
  it('removes a specific rate limit', () => {
    setRateLimit('GET', '/users', { maxRequests: 10, windowMs: 1000 });
    removeRateLimit('GET', '/users');
    expect(getRateLimit('GET', '/users')).toBeUndefined();
  });
});

describe('isRateLimited', () => {
  it('returns false when no limit is set', () => {
    expect(isRateLimited('GET', '/no-limit', 999)).toBe(false);
  });

  it('returns false when under the limit', () => {
    setRateLimit('GET', '/users', { maxRequests: 100, windowMs: 60000 });
    expect(isRateLimited('GET', '/users', 50)).toBe(false);
  });

  it('returns true when at or over the limit', () => {
    setRateLimit('GET', '/users', { maxRequests: 100, windowMs: 60000 });
    expect(isRateLimited('GET', '/users', 100)).toBe(true);
    expect(isRateLimited('GET', '/users', 150)).toBe(true);
  });
});
