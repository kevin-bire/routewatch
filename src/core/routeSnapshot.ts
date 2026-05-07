import { RouteDefinition } from './routeCollector';

export interface RouteSnapshot {
  id: string;
  label: string;
  routes: RouteDefinition[];
  createdAt: number;
}

const snapshots = new Map<string, RouteSnapshot>();

function makeId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createSnapshot(routes: RouteDefinition[], label?: string): RouteSnapshot {
  const id = makeId();
  const snapshot: RouteSnapshot = {
    id,
    label: label ?? `Snapshot ${new Date().toISOString()}`,
    routes: JSON.parse(JSON.stringify(routes)),
    createdAt: Date.now(),
  };
  snapshots.set(id, snapshot);
  return snapshot;
}

export function getSnapshot(id: string): RouteSnapshot | undefined {
  return snapshots.get(id);
}

export function getAllSnapshots(): RouteSnapshot[] {
  return Array.from(snapshots.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteSnapshot(id: string): boolean {
  return snapshots.delete(id);
}

export function clearSnapshots(): void {
  snapshots.clear();
}

export function diffSnapshots(
  baseId: string,
  compareId: string
): { added: RouteDefinition[]; removed: RouteDefinition[]; unchanged: RouteDefinition[] } | null {
  const base = snapshots.get(baseId);
  const compare = snapshots.get(compareId);
  if (!base || !compare) return null;

  const makeKey = (r: RouteDefinition) => `${r.method.toUpperCase()}:${r.path}`;
  const baseKeys = new Set(base.routes.map(makeKey));
  const compareKeys = new Set(compare.routes.map(makeKey));

  const added = compare.routes.filter(r => !baseKeys.has(makeKey(r)));
  const removed = base.routes.filter(r => !compareKeys.has(makeKey(r)));
  const unchanged = compare.routes.filter(r => baseKeys.has(makeKey(r)));

  return { added, removed, unchanged };
}
