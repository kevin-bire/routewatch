/**
 * routeEnvironment.ts
 * Manage per-route environment tags (e.g. production, staging, development)
 */

export type Environment = 'production' | 'staging' | 'development' | string;

interface EnvironmentEntry {
  environments: Environment[];
  updatedAt: Date;
}

const store = new Map<string, EnvironmentEntry>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteEnvironments(
  method: string,
  path: string,
  environments: Environment[]
): void {
  const key = makeKey(method, path);
  store.set(key, { environments, updatedAt: new Date() });
}

export function getRouteEnvironments(
  method: string,
  path: string
): Environment[] | undefined {
  return store.get(makeKey(method, path))?.environments;
}

export function isRouteInEnvironment(
  method: string,
  path: string,
  env: Environment
): boolean {
  const entry = store.get(makeKey(method, path));
  if (!entry) return true; // no restriction means available everywhere
  return entry.environments.includes(env);
}

export function removeRouteEnvironments(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function getAllRouteEnvironments(): Record<string, Environment[]> {
  const result: Record<string, Environment[]> = {};
  for (const [key, entry] of store.entries()) {
    result[key] = entry.environments;
  }
  return result;
}

export function filterRoutesByEnvironment(
  routes: Array<{ method: string; path: string }>,
  env: Environment
): Array<{ method: string; path: string }> {
  return routes.filter((r) => isRouteInEnvironment(r.method, r.path, env));
}

export function clearEnvironments(): void {
  store.clear();
}
