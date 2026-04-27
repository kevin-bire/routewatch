import { searchRoutes, extractSearchQuery, SearchOptions } from './routeSearch';
import { RouteDefinition } from './routeCollector';

const sampleRoutes: RouteDefinition[] = [
  { method: 'GET', path: '/users', summary: 'List users', tags: ['users'] },
  { method: 'POST', path: '/users', summary: 'Create user', tags: ['users'] },
  { method: 'GET', path: '/products', summary: 'List products', tags: ['products'] },
  { method: 'DELETE', path: '/users/:id', summary: 'Delete user', tags: ['users', 'admin'] },
];

describe('searchRoutes', () => {
  it('returns all routes with score 0 when query is empty', () => {
    const results = searchRoutes(sampleRoutes, { query: '' });
    expect(results).toHaveLength(sampleRoutes.length);
    results.forEach(r => expect(r.score).toBe(0));
  });

  it('finds routes matching path', () => {
    const results = searchRoutes(sampleRoutes, { query: '/users' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r.matchedFields).toContain('path'));
  });

  it('finds routes matching method', () => {
    const results = searchRoutes(sampleRoutes, { query: 'GET' });
    expect(results.every(r => r.route.method === 'GET')).toBe(true);
  });

  it('finds routes matching tags', () => {
    const results = searchRoutes(sampleRoutes, { query: 'admin' });
    expect(results).toHaveLength(1);
    expect(results[0].route.path).toBe('/users/:id');
  });

  it('finds routes matching summary', () => {
    const results = searchRoutes(sampleRoutes, { query: 'Create' });
    expect(results).toHaveLength(1);
    expect(results[0].route.method).toBe('POST');
  });

  it('sorts results by score descending', () => {
    const results = searchRoutes(sampleRoutes, { query: 'users' });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('respects caseSensitive option', () => {
    const sensitive = searchRoutes(sampleRoutes, { query: 'get', caseSensitive: true });
    expect(sensitive).toHaveLength(0);
    const insensitive = searchRoutes(sampleRoutes, { query: 'get', caseSensitive: false });
    expect(insensitive.length).toBeGreaterThan(0);
  });

  it('respects fields filter', () => {
    const results = searchRoutes(sampleRoutes, { query: 'users', fields: ['tags'] });
    results.forEach(r => expect(r.matchedFields).toContain('tags'));
  });
});

describe('extractSearchQuery', () => {
  it('returns trimmed string for string input', () => {
    expect(extractSearchQuery('  hello  ')).toBe('hello');
  });

  it('returns empty string for non-string input', () => {
    expect(extractSearchQuery(null)).toBe('');
    expect(extractSearchQuery(undefined)).toBe('');
    expect(extractSearchQuery(42)).toBe('');
  });
});
