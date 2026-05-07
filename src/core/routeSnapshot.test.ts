import {
  createSnapshot,
  getSnapshot,
  getAllSnapshots,
  deleteSnapshot,
  clearSnapshots,
  diffSnapshots,
} from './routeSnapshot';
import { RouteDefinition } from './routeCollector';

const r1: RouteDefinition = { method: 'GET', path: '/users', tags: [], summary: '' };
const r2: RouteDefinition = { method: 'POST', path: '/users', tags: [], summary: '' };
const r3: RouteDefinition = { method: 'DELETE', path: '/users/:id', tags: [], summary: '' };

beforeEach(() => clearSnapshots());

describe('createSnapshot', () => {
  it('creates a snapshot with a unique id', () => {
    const s = createSnapshot([r1, r2]);
    expect(s.id).toMatch(/^snap_/);
    expect(s.routes).toHaveLength(2);
  });

  it('uses provided label', () => {
    const s = createSnapshot([r1], 'v1.0');
    expect(s.label).toBe('v1.0');
  });

  it('defaults label when not provided', () => {
    const s = createSnapshot([r1]);
    expect(s.label).toContain('Snapshot');
  });

  it('deep-copies routes', () => {
    const routes = [{ ...r1 }];
    const s = createSnapshot(routes);
    routes[0].path = '/mutated';
    expect(s.routes[0].path).toBe('/users');
  });
});

describe('getSnapshot', () => {
  it('returns snapshot by id', () => {
    const s = createSnapshot([r1]);
    expect(getSnapshot(s.id)).toEqual(s);
  });

  it('returns undefined for unknown id', () => {
    expect(getSnapshot('nonexistent')).toBeUndefined();
  });
});

describe('getAllSnapshots', () => {
  it('returns all snapshots sorted newest first', () => {
    const s1 = createSnapshot([r1]);
    const s2 = createSnapshot([r2]);
    const all = getAllSnapshots();
    expect(all[0].id).toBe(s2.id);
    expect(all[1].id).toBe(s1.id);
  });
});

describe('deleteSnapshot', () => {
  it('removes a snapshot', () => {
    const s = createSnapshot([r1]);
    expect(deleteSnapshot(s.id)).toBe(true);
    expect(getSnapshot(s.id)).toBeUndefined();
  });

  it('returns false for unknown id', () => {
    expect(deleteSnapshot('ghost')).toBe(false);
  });
});

describe('diffSnapshots', () => {
  it('returns null when either snapshot is missing', () => {
    const s = createSnapshot([r1]);
    expect(diffSnapshots(s.id, 'missing')).toBeNull();
  });

  it('correctly diffs added, removed, and unchanged routes', () => {
    const base = createSnapshot([r1, r2]);
    const compare = createSnapshot([r2, r3]);
    const diff = diffSnapshots(base.id, compare.id);
    expect(diff).not.toBeNull();
    expect(diff!.added).toHaveLength(1);
    expect(diff!.added[0].path).toBe('/users/:id');
    expect(diff!.removed).toHaveLength(1);
    expect(diff!.removed[0].method).toBe('GET');
    expect(diff!.unchanged).toHaveLength(1);
  });
});
