import {
  setLogPolicy,
  getLogPolicy,
  removeLogPolicy,
  getAllLogPolicies,
  isLoggingEnabled,
  clearLogPolicies,
  makeKey,
} from './routeLogging';

beforeEach(() => {
  clearLogPolicies();
});

describe('makeKey', () => {
  it('should normalize method to uppercase', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
    expect(makeKey('POST', '/items')).toBe('POST:/items');
  });
});

describe('setLogPolicy / getLogPolicy', () => {
  it('should store and retrieve a log policy', () => {
    setLogPolicy('GET', '/users', { enabled: true, level: 'info' });
    const policy = getLogPolicy('GET', '/users');
    expect(policy).toEqual({ enabled: true, level: 'info' });
  });

  it('should return undefined for unknown routes', () => {
    expect(getLogPolicy('GET', '/unknown')).toBeUndefined();
  });

  it('should overwrite existing policy', () => {
    setLogPolicy('GET', '/users', { enabled: true, level: 'debug' });
    setLogPolicy('GET', '/users', { enabled: false, level: 'error' });
    expect(getLogPolicy('GET', '/users')).toEqual({ enabled: false, level: 'error' });
  });
});

describe('removeLogPolicy', () => {
  it('should remove an existing policy and return true', () => {
    setLogPolicy('DELETE', '/items/:id', { enabled: true });
    expect(removeLogPolicy('DELETE', '/items/:id')).toBe(true);
    expect(getLogPolicy('DELETE', '/items/:id')).toBeUndefined();
  });

  it('should return false when policy does not exist', () => {
    expect(removeLogPolicy('PUT', '/nothing')).toBe(false);
  });
});

describe('getAllLogPolicies', () => {
  it('should return all stored policies', () => {
    setLogPolicy('GET', '/a', { enabled: true, level: 'info' });
    setLogPolicy('POST', '/b', { enabled: false, includeBody: true });
    const all = getAllLogPolicies();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toEqual({ enabled: true, level: 'info' });
    expect(all['POST:/b']).toEqual({ enabled: false, includeBody: true });
  });

  it('should return empty object when store is empty', () => {
    expect(getAllLogPolicies()).toEqual({});
  });
});

describe('isLoggingEnabled', () => {
  it('should return true when policy is enabled', () => {
    setLogPolicy('GET', '/logs', { enabled: true });
    expect(isLoggingEnabled('GET', '/logs')).toBe(true);
  });

  it('should return false when policy is disabled', () => {
    setLogPolicy('GET', '/logs', { enabled: false });
    expect(isLoggingEnabled('GET', '/logs')).toBe(false);
  });

  it('should return false when no policy is set', () => {
    expect(isLoggingEnabled('GET', '/nopolicy')).toBe(false);
  });
});
