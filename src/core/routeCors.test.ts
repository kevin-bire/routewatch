import {
  setRouteCors,
  getRouteCors,
  removeRouteCors,
  getAllCorsPolicies,
  clearCorsPolicies,
  isOriginAllowed,
  applyCorsPolicyHeaders,
} from './routeCors';

beforeEach(() => {
  clearCorsPolicies();
});

describe('setRouteCors / getRouteCors', () => {
  it('stores and retrieves a cors policy', () => {
    setRouteCors('GET', '/api/users', { origins: ['https://example.com'], methods: ['GET'] });
    const policy = getRouteCors('GET', '/api/users');
    expect(policy).toBeDefined();
    expect(policy?.origins).toContain('https://example.com');
  });

  it('returns undefined for unknown route', () => {
    expect(getRouteCors('POST', '/unknown')).toBeUndefined();
  });

  it('is case-insensitive on method', () => {
    setRouteCors('get', '/api/items', { origins: ['*'] });
    expect(getRouteCors('GET', '/api/items')).toBeDefined();
  });
});

describe('removeRouteCors', () => {
  it('removes an existing policy', () => {
    setRouteCors('DELETE', '/api/data', { origins: ['https://a.com'] });
    expect(removeRouteCors('DELETE', '/api/data')).toBe(true);
    expect(getRouteCors('DELETE', '/api/data')).toBeUndefined();
  });

  it('returns false when policy does not exist', () => {
    expect(removeRouteCors('GET', '/nonexistent')).toBe(false);
  });
});

describe('getAllCorsPolicies', () => {
  it('returns all stored policies', () => {
    setRouteCors('GET', '/a', { origins: ['*'] });
    setRouteCors('POST', '/b', { origins: ['https://b.com'] });
    const all = getAllCorsPolicies();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toBeDefined();
    expect(all['POST:/b']).toBeDefined();
  });
});

describe('isOriginAllowed', () => {
  it('returns true for wildcard origin', () => {
    setRouteCors('GET', '/open', { origins: ['*'] });
    expect(isOriginAllowed('GET', '/open', 'https://anywhere.com')).toBe(true);
  });

  it('returns true for exact match', () => {
    setRouteCors('GET', '/strict', { origins: ['https://trusted.com'] });
    expect(isOriginAllowed('GET', '/strict', 'https://trusted.com')).toBe(true);
  });

  it('returns false for unlisted origin', () => {
    setRouteCors('GET', '/strict', { origins: ['https://trusted.com'] });
    expect(isOriginAllowed('GET', '/strict', 'https://evil.com')).toBe(false);
  });
});

describe('applyCorsPolicyHeaders', () => {
  it('returns correct headers for allowed origin', () => {
    setRouteCors('GET', '/api', {
      origins: ['https://example.com'],
      methods: ['GET', 'POST'],
      headers: ['Content-Type'],
      credentials: true,
      maxAge: 3600,
    });
    const headers = applyCorsPolicyHeaders('GET', '/api', 'https://example.com');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST');
    expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(headers['Access-Control-Max-Age']).toBe('3600');
  });

  it('returns empty object when no policy exists', () => {
    expect(applyCorsPolicyHeaders('GET', '/missing', 'https://x.com')).toEqual({});
  });
});
