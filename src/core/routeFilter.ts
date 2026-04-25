import { RouteDefinition } from './routeCollector';

export interface FilterOptions {
  method?: string | string[];
  pathPrefix?: string;
  tags?: string[];
  excludeInternal?: boolean;
}

/**
 * Filters routes based on provided options.
 */
export function filterRoutes(
  routes: RouteDefinition[],
  options: FilterOptions
): RouteDefinition[] {
  let filtered = [...routes];

  if (options.method) {
    const methods = Array.isArray(options.method)
      ? options.method.map((m) => m.toUpperCase())
      : [options.method.toUpperCase()];
    filtered = filtered.filter((r) => methods.includes(r.method.toUpperCase()));
  }

  if (options.pathPrefix) {
    const prefix = options.pathPrefix.startsWith('/')
      ? options.pathPrefix
      : `/${options.pathPrefix}`;
    filtered = filtered.filter((r) => r.path.startsWith(prefix));
  }

  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(
      (r) =>
        r.tags && r.tags.some((tag) => options.tags!.includes(tag))
    );
  }

  if (options.excludeInternal) {
    filtered = filtered.filter((r) => !r.internal);
  }

  return filtered;
}

/**
 * Groups routes by their first path segment (tag/resource).
 */
export function groupRoutesByTag(
  routes: RouteDefinition[]
): Record<string, RouteDefinition[]> {
  return routes.reduce<Record<string, RouteDefinition[]>>((acc, route) => {
    const segment = route.path.split('/').filter(Boolean)[0] || 'root';
    const tag =
      route.tags && route.tags.length > 0 ? route.tags[0] : segment;
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(route);
    return acc;
  }, {});
}
