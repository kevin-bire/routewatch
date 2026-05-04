/**
 * routeTimeout.ts
 * Stores and manages timeout configurations per route.
 */

export interface RouteTimeout {
  method: string;
  path: string;
  timeoutMs: number;
  action: 'warn' | 'abort';
}

const timeouts = new Map<string, RouteTimeout>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteTimeout(
  method: string,
  path: string,
  timeoutMs: number,
  action: 'warn' | 'abort' = 'warn'
): RouteTimeout {
  const key = makeKey(method, path);
  const entry: RouteTimeout = { method: method.toUpperCase(), path, timeoutMs, action };
  timeouts.set(key, entry);
  return entry;
}

export function getRouteTimeout(method: string, path: string): RouteTimeout | undefined {
  return timeouts.get(makeKey(method, path));
}

export function removeRouteTimeout(method: string, path: string): boolean {
  return timeouts.delete(makeKey(method, path));
}

export function getAllTimeouts(): RouteTimeout[] {
  return Array.from(timeouts.values());
}

export function clearTimeouts(): void {
  timeouts.clear();
}

export function hasTimeout(method: string, path: string): boolean {
  return timeouts.has(makeKey(method, path));
}
