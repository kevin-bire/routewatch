export interface RouteMetric {
  path: string;
  method: string;
  hitCount: number;
  lastAccessedAt: Date | null;
  avgResponseTimeMs: number | null;
}

const metricsStore = new Map<string, RouteMetric>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function recordHit(
  method: string,
  path: string,
  responseTimeMs?: number
): void {
  const key = makeKey(method, path);
  const existing = metricsStore.get(key);

  if (existing) {
    existing.hitCount += 1;
    existing.lastAccessedAt = new Date();
    if (responseTimeMs !== undefined) {
      const prevAvg = existing.avgResponseTimeMs ?? 0;
      existing.avgResponseTimeMs =
        (prevAvg * (existing.hitCount - 1) + responseTimeMs) /
        existing.hitCount;
    }
  } else {
    metricsStore.set(key, {
      path,
      method: method.toUpperCase(),
      hitCount: 1,
      lastAccessedAt: new Date(),
      avgResponseTimeMs: responseTimeMs ?? null,
    });
  }
}

export function getMetrics(): RouteMetric[] {
  return Array.from(metricsStore.values());
}

export function getMetricForRoute(
  method: string,
  path: string
): RouteMetric | undefined {
  return metricsStore.get(makeKey(method, path));
}

export function clearMetrics(): void {
  metricsStore.clear();
}
