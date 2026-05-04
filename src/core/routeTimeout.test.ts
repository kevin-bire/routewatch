import {
  setRouteTimeout,
  getRouteTimeout,
  removeRouteTimeout,
  getAllTimeouts,
  clearTimeouts,
  hasTimeout,
  makeKey,
} from './routeTimeout';

beforeEach(() => {
  clearTimeouts();
});

describe('makeKey', () => {
  it('uppercases the method', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('setRouteTimeout', () => {
  it('stores a timeout entry', () => {
    const entry = setRouteTimeout('GET', '/users', 3000);
    expect(entry.timeoutMs).toBe(3000);
    expect(entry.action).toBe('warn');
    expect(entry.method).toBe('GET');
  });

  it('stores abort action when specified', () => {
    const entry = setRouteTimeout('POST', '/upload', 5000, 'abort');
    expect(entry.action).toBe('abort');
  });

  it('overwrites existing entry', () => {
    setRouteTimeout('GET', '/users', 1000);
    setRouteTimeout('GET', '/users', 2000, 'abort');
    const entry = getRouteTimeout('GET', '/users');
    expect(entry?.timeoutMs).toBe(2000);
    expect(entry?.action).toBe('abort');
  });
});

describe('getRouteTimeout', () => {
  it('returns undefined for unknown route', () => {
    expect(getRouteTimeout('DELETE', '/missing')).toBeUndefined();
  });

  it('returns stored timeout', () => {
    setRouteTimeout('GET', '/ping', 500);
    expect(getRouteTimeout('GET', '/ping')?.timeoutMs).toBe(500);
  });
});

describe('removeRouteTimeout', () => {
  it('removes an existing entry', () => {
    setRouteTimeout('GET', '/items', 1000);
    expect(removeRouteTimeout('GET', '/items')).toBe(true);
    expect(hasTimeout('GET', '/items')).toBe(false);
  });

  it('returns false when entry does not exist', () => {
    expect(removeRouteTimeout('GET', '/nope')).toBe(false);
  });
});

describe('getAllTimeouts', () => {
  it('returns all stored timeouts', () => {
    setRouteTimeout('GET', '/a', 100);
    setRouteTimeout('POST', '/b', 200);
    expect(getAllTimeouts()).toHaveLength(2);
  });

  it('returns empty array when none set', () => {
    expect(getAllTimeouts()).toEqual([]);
  });
});

describe('hasTimeout', () => {
  it('returns true when timeout exists', () => {
    setRouteTimeout('GET', '/check', 999);
    expect(hasTimeout('GET', '/check')).toBe(true);
  });

  it('returns false when timeout does not exist', () => {
    expect(hasTimeout('GET', '/no')).toBe(false);
  });
});
