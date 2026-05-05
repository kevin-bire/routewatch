/**
 * routeCache.ts
 * Per-route response caching configuration store.
 */

export interface CachePolicy {
  ttl: number; // seconds
  varyBy?: string[]; // headers or query params to vary cache on
  noStore?: boolean;
  tags?: string[];
}

const cacheStore = new Map<string, CachePolicy>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setCache(method: string, path: string, policy: CachePolicy): void {
  cacheStore.set(makeKey(method, path), { ...policy });
}

export function getCache(method: string, path: string): CachePolicy | undefined {
  return cacheStore.get(makeKey(method, path));
}

export function removeCache(method: string, path: string): boolean {
  return cacheStore.delete(makeKey(method, path));
}

export function getAllCachePolicies(): Record<string, CachePolicy> {
  const result: Record<string, CachePolicy> = {};
  for (const [key, policy] of cacheStore.entries()) {
    result[key] = policy;
  }
  return result;
}

export function clearAllCachePolicies(): void {
  cacheStore.clear();
}

export function isCacheEnabled(method: string, path: string): boolean {
  const policy = getCache(method, path);
  return !!policy && !policy.noStore;
}

export function getCacheHeaders(method: string, path: string): Record<string, string> {
  const policy = getCache(method, path);
  if (!policy || policy.noStore) {
    return { 'Cache-Control': 'no-store' };
  }
  const directives = [`max-age=${policy.ttl}`];
  if (policy.varyBy && policy.varyBy.length > 0) {
    return {
      'Cache-Control': directives.join(', '),
      'Vary': policy.varyBy.join(', '),
    };
  }
  return { 'Cache-Control': directives.join(', ') };
}
