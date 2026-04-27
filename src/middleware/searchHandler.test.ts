import { createSearchHandler, registerSearchRoute } from './searchHandler';
import * as routeCollector from '../core/routeCollector';

const mockRoutes = [
  { method: 'GET', path: '/users', summary: 'List users', tags: ['users'] },
  { method: 'POST', path: '/orders', summary: 'Create order', tags: ['orders'] },
];

const mockReq = (query: Record<string, string> = {}) =>
  ({ query } as any);

const mockRes = () => {
  const res: any = {};
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('createSearchHandler', () => {
  beforeEach(() => {
    jest.spyOn(routeCollector, 'getRoutes').mockReturnValue(mockRoutes as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns all routes when query is empty', () => {
    const handler = createSearchHandler();
    const req = mockReq({ q: '' });
    const res = mockRes();
    handler(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 2 })
    );
  });

  it('filters routes by query', () => {
    const handler = createSearchHandler();
    const req = mockReq({ q: 'users' });
    const res = mockRes();
    handler(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.total).toBe(1);
    expect(call.results[0].route.path).toBe('/users');
  });

  it('includes matchedFields and score in response', () => {
    const handler = createSearchHandler();
    const req = mockReq({ q: 'orders' });
    const res = mockRes();
    handler(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.results[0]).toHaveProperty('matchedFields');
    expect(call.results[0]).toHaveProperty('score');
  });

  it('passes caseSensitive option', () => {
    const handler = createSearchHandler({ caseSensitive: true });
    const req = mockReq({ q: 'GET' });
    const res = mockRes();
    handler(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.query).toBe('GET');
  });
});

describe('registerSearchRoute', () => {
  it('registers GET route at default path', () => {
    const app = { get: jest.fn() };
    registerSearchRoute(app as any);
    expect(app.get).toHaveBeenCalledWith('/_routewatch/search', expect.any(Function));
  });

  it('registers GET route at custom path', () => {
    const app = { get: jest.fn() };
    registerSearchRoute(app as any, { path: '/api/search' });
    expect(app.get).toHaveBeenCalledWith('/api/search', expect.any(Function));
  });
});
