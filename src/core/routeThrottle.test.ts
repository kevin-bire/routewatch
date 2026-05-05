import {
  setThrottle,
  getThrottle,
  removeThrottle,
  getAllThrottles,
  checkThrottle,
  clearThrottles,
  makeKey,
} from './routeThrottle';

beforeEach(() => clearThrottles());

describe('makeKey', () => {
  it('combines method and path', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setThrottle / getThrottle', () => {
  it('stores and retrieves a throttle policy', () => {
    setThrottle('GET', '/items', { requestsPerWindow: 10, windowMs: 1000 });
    const policy = getThrottle('GET', '/items');
    expect(policy).toEqual({ requestsPerWindow: 10, windowMs: 1000 });
  });

  it('returns undefined for unknown route', () => {
    expect(getThrottle('POST', '/missing')).toBeUndefined();
  });
});

describe('removeThrottle', () => {
  it('removes an existing throttle', () => {
    setThrottle('DELETE', '/res', { requestsPerWindow: 5, windowMs: 500 });
    expect(removeThrottle('DELETE', '/res')).toBe(true);
    expect(getThrottle('DELETE', '/res')).toBeUndefined();
  });

  it('returns false when not found', () => {
    expect(removeThrottle('GET', '/nope')).toBe(false);
  });
});

describe('getAllThrottles', () => {
  it('returns all stored policies', () => {
    setThrottle('GET', '/a', { requestsPerWindow: 3, windowMs: 300 });
    setThrottle('POST', '/b', { requestsPerWindow: 5, windowMs: 500 });
    const all = getAllThrottles();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toEqual({ requestsPerWindow: 3, windowMs: 300 });
  });
});

describe('checkThrottle', () => {
  it('allows requests within limit', () => {
    setThrottle('GET', '/throttled', { requestsPerWindow: 3, windowMs: 10000 });
    expect(checkThrottle('GET', '/throttled').allowed).toBe(true);
    expect(checkThrottle('GET', '/throttled').allowed).toBe(true);
    expect(checkThrottle('GET', '/throttled').allowed).toBe(true);
  });

  it('blocks when limit exceeded', () => {
    setThrottle('GET', '/limited', { requestsPerWindow: 2, windowMs: 10000 });
    checkThrottle('GET', '/limited');
    checkThrottle('GET', '/limited');
    const result = checkThrottle('GET', '/limited');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('allows requests with no policy', () => {
    expect(checkThrottle('GET', '/open').allowed).toBe(true);
  });

  it('respects burstLimit over requestsPerWindow', () => {
    setThrottle('POST', '/burst', { requestsPerWindow: 10, windowMs: 10000, burstLimit: 1 });
    checkThrottle('POST', '/burst');
    expect(checkThrottle('POST', '/burst').allowed).toBe(false);
  });
});
