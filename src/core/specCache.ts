import { OpenAPISpec } from './schemaBuilder';

let cachedSpec: OpenAPISpec | null = null;
let isDirty = true;
let lastUpdatedAt: Date | null = null;

/**
 * Mark the cache as stale so the next read triggers a rebuild.
 */
export function invalidateCache(): void {
  isDirty = true;
}

/**
 * Returns true when the cache needs to be rebuilt.
 */
export function isCacheDirty(): boolean {
  return isDirty;
}

/**
 * Store a freshly built spec and mark the cache as clean.
 */
export function setCache(spec: OpenAPISpec): void {
  cachedSpec = spec;
  isDirty = false;
  lastUpdatedAt = new Date();
}

/**
 * Retrieve the cached spec, or null if not yet built / invalidated.
 */
export function getCache(): OpenAPISpec | null {
  if (isDirty) return null;
  return cachedSpec;
}

/**
 * Returns the timestamp of the last successful cache population,
 * or null if the cache has never been set.
 */
export function getLastUpdatedAt(): Date | null {
  return lastUpdatedAt;
}

/**
 * Clear everything — useful in tests.
 */
export function clearCache(): void {
  cachedSpec = null;
  isDirty = true;
  lastUpdatedAt = null;
}
