import {
  recordTrace,
  getTraces,
  getAllTraces,
  clearTraces,
  generateTraceId,
  makeKey,
} from './routeTracing';

beforeEach(() => clearTraces());

describe('makeKey', () => {
  it('combines method and path', () => {
    expect(makeKey('get', '/users')).toBe('GET:/users');
  });
});

describe('generateTraceId', () => {
  it('returns a unique string each call', () => {
    const a = generateTraceId();
    const b = generateTraceId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^trace-/);
  });
});

describe('recordTrace / getTraces', () => {
  it('stores and retrieves traces', () => {
    recordTrace({ traceId: 't1', method: 'GET', path: '/users', startedAt: 1000, duration: 50, statusCode: 200 });
    const traces = getTraces('GET', '/users');
    expect(traces).toHaveLength(1);
    expect(traces[0].traceId).toBe('t1');
  });

  it('prepends newer traces', () => {
    recordTrace({ traceId: 't1', method: 'GET', path: '/a', startedAt: 1000 });
    recordTrace({ traceId: 't2', method: 'GET', path: '/a', startedAt: 2000 });
    const traces = getTraces('GET', '/a');
    expect(traces[0].traceId).toBe('t2');
  });

  it('returns empty array for unknown route', () => {
    expect(getTraces('POST', '/unknown')).toEqual([]);
  });
});

describe('getAllTraces', () => {
  it('returns all routes with traces', () => {
    recordTrace({ traceId: 't1', method: 'GET', path: '/a', startedAt: 1 });
    recordTrace({ traceId: 't2', method: 'POST', path: '/b', startedAt: 2 });
    const all = getAllTraces();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all['GET:/a']).toHaveLength(1);
  });
});

describe('clearTraces', () => {
  it('clears a specific route', () => {
    recordTrace({ traceId: 't1', method: 'GET', path: '/a', startedAt: 1 });
    clearTraces('GET', '/a');
    expect(getTraces('GET', '/a')).toHaveLength(0);
  });

  it('clears all traces', () => {
    recordTrace({ traceId: 't1', method: 'GET', path: '/a', startedAt: 1 });
    recordTrace({ traceId: 't2', method: 'POST', path: '/b', startedAt: 2 });
    clearTraces();
    expect(Object.keys(getAllTraces())).toHaveLength(0);
  });
});
