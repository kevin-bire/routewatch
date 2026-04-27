import { RouteDefinition } from './routeCollector';

export interface ChangelogEntry {
  timestamp: string;
  route: RouteDefinition;
  changeType: 'added' | 'removed' | 'modified';
  previousRoute?: RouteDefinition;
}

const changelog: ChangelogEntry[] = [];
let snapshot: RouteDefinition[] = [];

export function takeSnapshot(routes: RouteDefinition[]): void {
  snapshot = routes.map((r) => ({ ...r }));
}

export function diffRoutes(
  previous: RouteDefinition[],
  current: RouteDefinition[]
): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const timestamp = new Date().toISOString();

  const prevMap = new Map(previous.map((r) => [`${r.method}:${r.path}`, r]));
  const currMap = new Map(current.map((r) => [`${r.method}:${r.path}`, r]));

  for (const [key, route] of currMap) {
    if (!prevMap.has(key)) {
      entries.push({ timestamp, route, changeType: 'added' });
    } else {
      const prev = prevMap.get(key)!;
      if (JSON.stringify(prev) !== JSON.stringify(route)) {
        entries.push({ timestamp, route, changeType: 'modified', previousRoute: prev });
      }
    }
  }

  for (const [key, route] of prevMap) {
    if (!currMap.has(key)) {
      entries.push({ timestamp, route, changeType: 'removed' });
    }
  }

  return entries;
}

export function recordChanges(current: RouteDefinition[]): ChangelogEntry[] {
  const entries = diffRoutes(snapshot, current);
  changelog.push(...entries);
  takeSnapshot(current);
  return entries;
}

export function getChangelog(): ChangelogEntry[] {
  return [...changelog];
}

export function clearChangelog(): void {
  changelog.length = 0;
  snapshot = [];
}
