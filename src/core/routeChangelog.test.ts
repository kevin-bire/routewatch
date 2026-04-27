import {
  takeSnapshot,
  diffRoutes,
  recordChanges,
  getChangelog,
  clearChangelog,
} from './routeChangelog';
import { RouteDefinition } from './routeCollector';

const routeA: RouteDefinition = { method: 'GET', path: '/users', summary: 'List users', tags: [] };
const routeB: RouteDefinition = { method: 'POST', path: '/users', summary: 'Create user', tags: [] };
const routeAModified: RouteDefinition = { method: 'GET', path: '/users', summary: 'Get all users', tags: [] };

beforeEach(() => {
  clearChangelog();
});

describe('diffRoutes', () => {
  it('detects added routes', () => {
    const entries = diffRoutes([], [routeA]);
    expect(entries).toHaveLength(1);
    expect(entries[0].changeType).toBe('added');
    expect(entries[0].route.path).toBe('/users');
  });

  it('detects removed routes', () => {
    const entries = diffRoutes([routeA], []);
    expect(entries).toHaveLength(1);
    expect(entries[0].changeType).toBe('removed');
  });

  it('detects modified routes', () => {
    const entries = diffRoutes([routeA], [routeAModified]);
    expect(entries).toHaveLength(1);
    expect(entries[0].changeType).toBe('modified');
    expect(entries[0].previousRoute?.summary).toBe('List users');
  });

  it('returns empty array when no changes', () => {
    const entries = diffRoutes([routeA], [routeA]);
    expect(entries).toHaveLength(0);
  });
});

describe('recordChanges', () => {
  it('accumulates changelog entries', () => {
    takeSnapshot([routeA]);
    recordChanges([routeA, routeB]);
    expect(getChangelog()).toHaveLength(1);
    expect(getChangelog()[0].changeType).toBe('added');
  });

  it('updates snapshot after recording', () => {
    takeSnapshot([routeA]);
    recordChanges([routeB]);
    const entries = recordChanges([routeA]);
    expect(entries.some((e) => e.changeType === 'added')).toBe(true);
  });
});

describe('clearChangelog', () => {
  it('resets changelog and snapshot', () => {
    takeSnapshot([routeA]);
    recordChanges([routeA, routeB]);
    clearChangelog();
    expect(getChangelog()).toHaveLength(0);
  });
});
