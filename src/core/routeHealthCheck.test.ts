import {
  recordHealth,
  getRouteHealth,
  getAllHealthChecks,
  removeRouteHealth,
  clearHealthChecks,
  summarizeHealth,
} from './routeHealthCheck';

beforeEach(() => {
  clearHealthChecks();
});

describe('recordHealth', () => {
  it('stores a health entry', () => {
    const entry = recordHealth('GET', '/users', 'healthy', 42);
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/users');
    expect(entry.status).toBe('healthy');
    expect(entry.latencyMs).toBe(42);
    expect(entry.lastChecked).toBeDefined();
  });

  it('normalizes method to uppercase', () => {
    const entry = recordHealth('get', '/ping', 'healthy');
    expect(entry.method).toBe('GET');
  });

  it('overwrites an existing entry', () => {
    recordHealth('GET', '/users', 'healthy', 10);
    recordHealth('GET', '/users', 'degraded', 500, 'slow response');
    const entry = getRouteHealth('GET', '/users');
    expect(entry?.status).toBe('degraded');
    expect(entry?.notes).toBe('slow response');
  });
});

describe('getRouteHealth', () => {
  it('returns undefined for unknown route', () => {
    expect(getRouteHealth('POST', '/unknown')).toBeUndefined();
  });

  it('returns the stored entry', () => {
    recordHealth('DELETE', '/items/1', 'unknown');
    const entry = getRouteHealth('DELETE', '/items/1');
    expect(entry?.status).toBe('unknown');
  });
});

describe('getAllHealthChecks', () => {
  it('returns all entries', () => {
    recordHealth('GET', '/a', 'healthy');
    recordHealth('POST', '/b', 'degraded');
    expect(getAllHealthChecks()).toHaveLength(2);
  });
});

describe('removeRouteHealth', () => {
  it('removes an existing entry', () => {
    recordHealth('GET', '/remove-me', 'healthy');
    expect(removeRouteHealth('GET', '/remove-me')).toBe(true);
    expect(getRouteHealth('GET', '/remove-me')).toBeUndefined();
  });

  it('returns false when entry does not exist', () => {
    expect(removeRouteHealth('GET', '/nope')).toBe(false);
  });
});

describe('summarizeHealth', () => {
  it('returns correct counts', () => {
    recordHealth('GET', '/a', 'healthy');
    recordHealth('GET', '/b', 'healthy');
    recordHealth('POST', '/c', 'degraded');
    recordHealth('PUT', '/d', 'unknown');
    const summary = summarizeHealth();
    expect(summary.healthy).toBe(2);
    expect(summary.degraded).toBe(1);
    expect(summary.unknown).toBe(1);
    expect(summary.total).toBe(4);
  });
});
