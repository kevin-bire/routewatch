/**
 * routeRateLimiter.ts
 * Tracks and enforces per-route rate limit annotations for documentation purposes.
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export interface RouteRateLimit {
  method: string;
  path: string;
  config: RateLimitConfig;
  registeredAt: string;
}

const rateLimits = new Map<string, RouteRateLimit>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRateLimit(
  method: string,
  path: string,
  config: RateLimitConfig
): void {
  const key = makeKey(method, path);
  rateLimits.set(key, {
    method: method.toUpperCase(),
    path,
    config,
    registeredAt: new Date().toISOString(),
  });
}

export function getRateLimit(
  method: string,
  path: string
): RouteRateLimit | undefined {
  return rateLimits.get(makeKey(method, path));
}

export function getAllRateLimits(): RouteRateLimit[] {
  return Array.from(rateLimits.values());
}

export function removeRateLimit(method: string, path: string): boolean {
  return rateLimits.delete(makeKey(method, path));
}

export function clearRateLimits(): void {
  rateLimits.clear();
}

export function hasRateLimit(method: string, path: string): boolean {
  return rateLimits.has(makeKey(method, path));
}
