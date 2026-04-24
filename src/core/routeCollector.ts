export interface RouteDefinition {
  method: string;
  path: string;
  description?: string;
  tags?: string[];
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  responses?: Record<number, string>;
}

const routes: RouteDefinition[] = [];

/**
 * Register a route definition into the collector.
 */
export function registerRoute(route: RouteDefinition): void {
  const normalized: RouteDefinition = {
    ...route,
    method: route.method.toUpperCase(),
  };

  const exists = routes.some(
    (r) => r.method === normalized.method && r.path === normalized.path
  );

  if (!exists) {
    routes.push(normalized);
  }
}

/**
 * Retrieve all registered route definitions.
 */
export function getRoutes(): ReadonlyArray<RouteDefinition> {
  return routes;
}

/**
 * Clear all registered routes (useful for testing).
 */
export function clearRoutes(): void {
  routes.length = 0;
}
