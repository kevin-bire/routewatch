import {
  setRateLimit,
  getRateLimit,
  getAllRateLimits,
  removeRateLimit,
  clearRateLimits,
  hasRateLimit,
} from './routeRateLimiter';

describe('routeRateLimiter', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('should set and retrieve a rate limit for a route', () => {
    setRateLimit('GET', '/api/users', { windowMs: 60000, maxRequests: 100 });
    const result = getRateLimit('GET', '/api/users');
    expect(result).toBeDefined();
    expect(result?.method).toBe('GET');
    expect(result?.path).toBe('/api/users');
    expect(result?.config.maxRequests).toBe(100);
    expect(result?.config.windowMs).toBe(60000);
  });

  it('should normalize method to uppercase', () => {
    setRateLimit('post', '/api/items', { windowMs: 30000, maxRequests: 50 });
    const result = getRateLimit('POST', '/api/items');
    expect(result).toBeDefined();
    expect(result?.method).toBe('POST');
  });

  it('should return undefined for unknown route', () => {
    const result = getRateLimit('DELETE', '/api/unknown');
    expect(result).toBeUndefined();
  });

  it('should store registeredAt timestamp', () => {
    const before = new Date().toISOString();
    setRateLimit('GET', '/api/ping', { windowMs: 1000, maxRequests: 10 });
    const result = getRateLimit('GET', '/api/ping');
    expect(result?.registeredAt).toBeDefined();
    expect(result!.registeredAt >= before).toBe(true);
  });

  it('should return all rate limits', () => {
    setRateLimit('GET', '/a', { windowMs: 1000, maxRequests: 5 });
    setRateLimit('POST', '/b', { windowMs: 2000, maxRequests: 10 });
    const all = getAllRateLimits();
    expect(all).toHaveLength(2);
  });

  it('should remove a rate limit', () => {
    setRateLimit('GET', '/api/remove', { windowMs: 1000, maxRequests: 1 });
    expect(hasRateLimit('GET', '/api/remove')).toBe(true);
    const removed = removeRateLimit('GET', '/api/remove');
    expect(removed).toBe(true);
    expect(hasRateLimit('GET', '/api/remove')).toBe(false);
  });

  it('should return false when removing non-existent limit', () => {
    const removed = removeRateLimit('PUT', '/api/ghost');
    expect(removed).toBe(false);
  });

  it('should clear all rate limits', () => {
    setRateLimit('GET', '/x', { windowMs: 1000, maxRequests: 1 });
    setRateLimit('POST', '/y', { windowMs: 1000, maxRequests: 2 });
    clearRateLimits();
    expect(getAllRateLimits()).toHaveLength(0);
  });

  it('should support optional message in config', () => {
    setRateLimit('GET', '/api/limited', {
      windowMs: 60000,
      maxRequests: 10,
      message: 'Too many requests',
    });
    const result = getRateLimit('GET', '/api/limited');
    expect(result?.config.message).toBe('Too many requests');
  });
});
