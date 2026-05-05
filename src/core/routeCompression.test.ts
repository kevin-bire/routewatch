import {
  setCompression,
  getCompression,
  removeCompression,
  getAllCompressionPolicies,
  clearCompressionPolicies,
  isCompressionEnabled,
  getEffectiveEncodings,
  makeKey,
} from './routeCompression';

beforeEach(() => {
  clearCompressionPolicies();
});

describe('makeKey', () => {
  it('should combine method and path', () => {
    expect(makeKey('get', '/api/data')).toBe('GET:/api/data');
  });

  it('should uppercase the method', () => {
    expect(makeKey('post', '/submit')).toBe('POST:/submit');
  });
});

describe('setCompression / getCompression', () => {
  it('should store and retrieve a compression policy', () => {
    setCompression('GET', '/api/data', { enabled: true, encodings: ['gzip', 'br'], threshold: 1024 });
    const policy = getCompression('GET', '/api/data');
    expect(policy).toEqual({ enabled: true, encodings: ['gzip', 'br'], threshold: 1024 });
  });

  it('should return undefined for unknown routes', () => {
    expect(getCompression('DELETE', '/unknown')).toBeUndefined();
  });
});

describe('removeCompression', () => {
  it('should remove an existing policy', () => {
    setCompression('GET', '/api', { enabled: true, encodings: ['gzip'] });
    expect(removeCompression('GET', '/api')).toBe(true);
    expect(getCompression('GET', '/api')).toBeUndefined();
  });

  it('should return false when policy does not exist', () => {
    expect(removeCompression('GET', '/missing')).toBe(false);
  });
});

describe('getAllCompressionPolicies', () => {
  it('should return all stored policies', () => {
    setCompression('GET', '/a', { enabled: true, encodings: ['gzip'] });
    setCompression('POST', '/b', { enabled: false, encodings: [] });
    const all = getAllCompressionPolicies();
    expect(all).toHaveLength(2);
    expect(all.some((e) => e.method === 'GET' && e.path === '/a')).toBe(true);
    expect(all.some((e) => e.method === 'POST' && e.path === '/b')).toBe(true);
  });
});

describe('isCompressionEnabled', () => {
  it('should return true when enabled', () => {
    setCompression('GET', '/api', { enabled: true, encodings: ['gzip'] });
    expect(isCompressionEnabled('GET', '/api')).toBe(true);
  });

  it('should return false when disabled', () => {
    setCompression('GET', '/api', { enabled: false, encodings: [] });
    expect(isCompressionEnabled('GET', '/api')).toBe(false);
  });

  it('should return false for unknown route', () => {
    expect(isCompressionEnabled('GET', '/none')).toBe(false);
  });
});

describe('getEffectiveEncodings', () => {
  it('should return configured encodings when enabled', () => {
    setCompression('GET', '/api', { enabled: true, encodings: ['br', 'gzip'] });
    expect(getEffectiveEncodings('GET', '/api')).toEqual(['br', 'gzip']);
  });

  it('should fallback to gzip when encodings list is empty but enabled', () => {
    setCompression('GET', '/api', { enabled: true, encodings: [] });
    expect(getEffectiveEncodings('GET', '/api')).toEqual(['gzip']);
  });

  it('should return identity when disabled', () => {
    setCompression('GET', '/api', { enabled: false, encodings: ['gzip'] });
    expect(getEffectiveEncodings('GET', '/api')).toEqual(['identity']);
  });

  it('should return identity for unknown route', () => {
    expect(getEffectiveEncodings('GET', '/unknown')).toEqual(['identity']);
  });
});
