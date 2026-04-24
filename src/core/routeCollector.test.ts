import {
  registerRoute,
  getRoutes,
  clearRoutes,
  RouteDefinition,
} from './routeCollector';

describe('routeCollector', () => {
  beforeEach(() => {
    clearRoutes();
  });

  it('should register a route', () => {
    const route: RouteDefinition = { method: 'GET', path: '/users' };
    registerRoute(route);
    expect(getRoutes()).toHaveLength(1);
    expect(getRoutes()[0]).toMatchObject({ method: 'GET', path: '/users' });
  });

  it('should normalize method to uppercase', () => {
    registerRoute({ method: 'post', path: '/users' });
    expect(getRoutes()[0].method).toBe('POST');
  });

  it('should not register duplicate routes', () => {
    registerRoute({ method: 'GET', path: '/users' });
    registerRoute({ method: 'GET', path: '/users' });
    expect(getRoutes()).toHaveLength(1);
  });

  it('should allow same path with different methods', () => {
    registerRoute({ method: 'GET', path: '/users' });
    registerRoute({ method: 'POST', path: '/users' });
    expect(getRoutes()).toHaveLength(2);
  });

  it('should store optional metadata', () => {
    const route: RouteDefinition = {
      method: 'GET',
      path: '/items',
      description: 'List all items',
      tags: ['items'],
      responses: { 200: 'Success' },
    };
    registerRoute(route);
    const stored = getRoutes()[0];
    expect(stored.description).toBe('List all items');
    expect(stored.tags).toEqual(['items']);
    expect(stored.responses?.[200]).toBe('Success');
  });

  it('should clear all routes', () => {
    registerRoute({ method: 'GET', path: '/a' });
    registerRoute({ method: 'POST', path: '/b' });
    clearRoutes();
    expect(getRoutes()).toHaveLength(0);
  });
});
