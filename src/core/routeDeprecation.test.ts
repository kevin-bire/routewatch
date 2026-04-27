import {
  markDeprecated,
  isDeprecated,
  getDeprecation,
  getAllDeprecations,
  removeDeprecation,
  clearDeprecations,
} from './routeDeprecation';

beforeEach(() => {
  clearDeprecations();
});

describe('markDeprecated', () => {
  it('should mark a route as deprecated', () => {
    const entry = markDeprecated('GET', '/api/v1/users');
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/api/v1/users');
    expect(entry.deprecatedAt).toBeDefined();
  });

  it('should store optional metadata', () => {
    const entry = markDeprecated('POST', '/api/v1/items', {
      sunset: '2025-12-31',
      replacement: '/api/v2/items',
      reason: 'Use v2 endpoint instead',
    });
    expect(entry.sunset).toBe('2025-12-31');
    expect(entry.replacement).toBe('/api/v2/items');
    expect(entry.reason).toBe('Use v2 endpoint instead');
  });

  it('should normalize method to uppercase', () => {
    const entry = markDeprecated('get', '/api/v1/ping');
    expect(entry.method).toBe('GET');
  });
});

describe('isDeprecated', () => {
  it('should return true for deprecated routes', () => {
    markDeprecated('DELETE', '/api/v1/legacy');
    expect(isDeprecated('DELETE', '/api/v1/legacy')).toBe(true);
  });

  it('should return false for non-deprecated routes', () => {
    expect(isDeprecated('GET', '/api/v2/users')).toBe(false);
  });
});

describe('getDeprecation', () => {
  it('should return the deprecation entry', () => {
    markDeprecated('PUT', '/api/v1/resource', { reason: 'outdated' });
    const entry = getDeprecation('PUT', '/api/v1/resource');
    expect(entry).toBeDefined();
    expect(entry?.reason).toBe('outdated');
  });

  it('should return undefined for unknown routes', () => {
    expect(getDeprecation('GET', '/unknown')).toBeUndefined();
  });
});

describe('getAllDeprecations', () => {
  it('should return all deprecation entries', () => {
    markDeprecated('GET', '/api/v1/a');
    markDeprecated('POST', '/api/v1/b');
    expect(getAllDeprecations()).toHaveLength(2);
  });

  it('should return empty array when none exist', () => {
    expect(getAllDeprecations()).toHaveLength(0);
  });
});

describe('removeDeprecation', () => {
  it('should remove a deprecation entry', () => {
    markDeprecated('GET', '/api/v1/old');
    expect(removeDeprecation('GET', '/api/v1/old')).toBe(true);
    expect(isDeprecated('GET', '/api/v1/old')).toBe(false);
  });

  it('should return false if entry does not exist', () => {
    expect(removeDeprecation('GET', '/nonexistent')).toBe(false);
  });
});
