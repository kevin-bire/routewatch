export interface RouteHealth {
  method: string;
  path: string;
  status: 'healthy' | 'degraded' | 'unknown';
  lastChecked: number | null;
  latencyMs: number | null;
  notes?: string;
}

type HealthKey = string;

const healthStore = new Map<HealthKey, RouteHealth>();

function makeKey(method: string, path: string): HealthKey {
  return `${method.toUpperCase()}:${path}`;
}

export function recordHealth(
  method: string,
  path: string,
  status: RouteHealth['status'],
  latencyMs: number | null = null,
  notes?: string
): RouteHealth {
  const key = makeKey(method, path);
  const entry: RouteHealth = {
    method: method.toUpperCase(),
    path,
    status,
    lastChecked: Date.now(),
    latencyMs,
    notes,
  };
  healthStore.set(key, entry);
  return entry;
}

export function getRouteHealth(method: string, path: string): RouteHealth | undefined {
  return healthStore.get(makeKey(method, path));
}

export function getAllHealthChecks(): RouteHealth[] {
  return Array.from(healthStore.values());
}

export function removeRouteHealth(method: string, path: string): boolean {
  return healthStore.delete(makeKey(method, path));
}

export function clearHealthChecks(): void {
  healthStore.clear();
}

export function summarizeHealth(): { healthy: number; degraded: number; unknown: number; total: number } {
  const all = getAllHealthChecks();
  return {
    healthy: all.filter((r) => r.status === 'healthy').length,
    degraded: all.filter((r) => r.status === 'degraded').length,
    unknown: all.filter((r) => r.status === 'unknown').length,
    total: all.length,
  };
}
