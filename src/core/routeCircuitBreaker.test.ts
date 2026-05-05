import {
  setCircuitBreaker,
  getCircuitBreaker,
  recordFailure,
  recordSuccess,
  getCircuitState,
  getAllCircuitBreakers,
  removeCircuitBreaker,
  clearCircuitBreakers,
} from './routeCircuitBreaker';

beforeEach(() => clearCircuitBreakers());

describe('setCircuitBreaker / getCircuitBreaker', () => {
  it('stores and retrieves a config', () => {
    setCircuitBreaker('GET', '/api/users', { threshold: 3, resetTimeout: 5000 });
    const entry = getCircuitBreaker('GET', '/api/users');
    expect(entry).toBeDefined();
    expect(entry?.config.threshold).toBe(3);
    expect(entry?.state).toBe('closed');
  });

  it('returns undefined for unknown route', () => {
    expect(getCircuitBreaker('POST', '/unknown')).toBeUndefined();
  });
});

describe('recordFailure', () => {
  it('increments failure count', () => {
    setCircuitBreaker('GET', '/api/items', { threshold: 3, resetTimeout: 1000 });
    recordFailure('GET', '/api/items');
    recordFailure('GET', '/api/items');
    const entry = getCircuitBreaker('GET', '/api/items');
    expect(entry?.failures).toBe(2);
    expect(entry?.state).toBe('closed');
  });

  it('opens circuit when threshold is reached', () => {
    setCircuitBreaker('GET', '/api/items', { threshold: 2, resetTimeout: 1000 });
    recordFailure('GET', '/api/items');
    const state = recordFailure('GET', '/api/items');
    expect(state).toBe('open');
    expect(getCircuitBreaker('GET', '/api/items')?.state).toBe('open');
  });

  it('returns closed for unregistered route', () => {
    expect(recordFailure('DELETE', '/ghost')).toBe('closed');
  });
});

describe('recordSuccess', () => {
  it('resets failures and closes circuit', () => {
    setCircuitBreaker('POST', '/api/orders', { threshold: 2, resetTimeout: 1000 });
    recordFailure('POST', '/api/orders');
    recordFailure('POST', '/api/orders');
    recordSuccess('POST', '/api/orders');
    const entry = getCircuitBreaker('POST', '/api/orders');
    expect(entry?.failures).toBe(0);
    expect(entry?.state).toBe('closed');
  });
});

describe('getCircuitState', () => {
  it('transitions open -> half-open after resetTimeout', () => {
    setCircuitBreaker('GET', '/api/slow', { threshold: 1, resetTimeout: 0 });
    recordFailure('GET', '/api/slow');
    const state = getCircuitState('GET', '/api/slow');
    expect(state).toBe('half-open');
  });

  it('returns closed for unknown route', () => {
    expect(getCircuitState('GET', '/noop')).toBe('closed');
  });
});

describe('getAllCircuitBreakers', () => {
  it('returns all entries', () => {
    setCircuitBreaker('GET', '/a', { threshold: 3, resetTimeout: 1000 });
    setCircuitBreaker('POST', '/b', { threshold: 5, resetTimeout: 2000 });
    const all = getAllCircuitBreakers();
    expect(Object.keys(all)).toHaveLength(2);
  });
});

describe('removeCircuitBreaker', () => {
  it('removes an existing entry', () => {
    setCircuitBreaker('GET', '/rm', { threshold: 3, resetTimeout: 1000 });
    expect(removeCircuitBreaker('GET', '/rm')).toBe(true);
    expect(getCircuitBreaker('GET', '/rm')).toBeUndefined();
  });

  it('returns false for non-existent entry', () => {
    expect(removeCircuitBreaker('GET', '/ghost')).toBe(false);
  });
});
