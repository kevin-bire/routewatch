import {
  deriveTagFromPath,
  applyTagRules,
  autoTagRoute,
  autoTagRoutes,
  TagRule,
} from './routeTagger';
import { RouteDefinition } from './routeCollector';

const makeRoute = (path: string, tags?: string[]): RouteDefinition => ({
  method: 'GET',
  path,
  handler: 'handler',
  tags,
});

describe('deriveTagFromPath', () => {
  it('capitalises the first path segment', () => {
    expect(deriveTagFromPath('/users/123')).toBe('Users');
  });

  it('strips path parameter braces', () => {
    expect(deriveTagFromPath('/{id}/details')).toBe('Id');
  });

  it('returns General for root path', () => {
    expect(deriveTagFromPath('/')).toBe('General');
  });
});

describe('applyTagRules', () => {
  const rules: TagRule[] = [
    { pattern: /^\/auth/, tag: 'Authentication' },
    { pattern: /^\/items/, tag: 'Items' },
  ];

  it('returns matching tags', () => {
    const route = makeRoute('/auth/login');
    expect(applyTagRules(route, rules)).toEqual(['Authentication']);
  });

  it('returns empty array when no rules match', () => {
    const route = makeRoute('/orders/1');
    expect(applyTagRules(route, rules)).toEqual([]);
  });

  it('returns multiple tags when multiple rules match', () => {
    const multiRules: TagRule[] = [
      { pattern: /^\/v1/, tag: 'V1' },
      { pattern: /\/users/, tag: 'Users' },
    ];
    const route = makeRoute('/v1/users');
    expect(applyTagRules(route, multiRules)).toEqual(['V1', 'Users']);
  });
});

describe('autoTagRoute', () => {
  it('merges existing tags with derived tags', () => {
    const route = makeRoute('/auth/login', ['Public']);
    const result = autoTagRoute(route);
    expect(result.tags).toContain('Public');
    expect(result.tags).toContain('Authentication');
  });

  it('falls back to path-derived tag when no rules match', () => {
    const route = makeRoute('/products/42');
    const result = autoTagRoute(route, []);
    expect(result.tags).toEqual(['Products']);
  });

  it('deduplicates tags', () => {
    const route = makeRoute('/auth/register', ['Authentication']);
    const result = autoTagRoute(route);
    const count = result.tags!.filter((t) => t === 'Authentication').length;
    expect(count).toBe(1);
  });
});

describe('autoTagRoutes', () => {
  it('tags all routes in the array', () => {
    const routes = [makeRoute('/users'), makeRoute('/health/check')];
    const result = autoTagRoutes(routes);
    expect(result[0].tags).toContain('Users');
    expect(result[1].tags).toContain('Health');
  });
});
