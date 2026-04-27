/**
 * routeGrouping.ts
 * Groups routes by various criteria (prefix, method, tag) for organized display.
 */

import { RouteDefinition } from './routeCollector';

export type GroupKey = string;
export type RouteGroup = { key: GroupKey; label: string; routes: RouteDefinition[] };

/**
 * Groups routes by their top-level path prefix (e.g. /users, /products).
 */
export function groupByPrefix(routes: RouteDefinition[]): RouteGroup[] {
  const map = new Map<string, RouteDefinition[]>();

  for (const route of routes) {
    const parts = route.path.replace(/^\//, '').split('/');
    const prefix = parts[0] ? `/${parts[0]}` : '/';
    if (!map.has(prefix)) map.set(prefix, []);
    map.get(prefix)!.push(route);
  }

  return Array.from(map.entries()).map(([key, routes]) => ({
    key,
    label: key,
    routes,
  }));
}

/**
 * Groups routes by HTTP method.
 */
export function groupByMethod(routes: RouteDefinition[]): RouteGroup[] {
  const map = new Map<string, RouteDefinition[]>();

  for (const route of routes) {
    const method = route.method.toUpperCase();
    if (!map.has(method)) map.set(method, []);
    map.get(method)!.push(route);
  }

  return Array.from(map.entries()).map(([key, routes]) => ({
    key,
    label: key,
    routes,
  }));
}

/**
 * Groups routes by the first tag assigned to each route.
 * Routes without tags are placed under "untagged".
 */
export function groupByTag(routes: RouteDefinition[]): RouteGroup[] {
  const map = new Map<string, RouteDefinition[]>();

  for (const route of routes) {
    const tag = (route.tags && route.tags.length > 0) ? route.tags[0] : 'untagged';
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag)!.push(route);
  }

  return Array.from(map.entries()).map(([key, routes]) => ({
    key,
    label: key,
    routes,
  }));
}

/**
 * Generic grouping function that accepts a key extractor.
 */
export function groupRoutes(
  routes: RouteDefinition[],
  keyFn: (route: RouteDefinition) => string
): RouteGroup[] {
  const map = new Map<string, RouteDefinition[]>();

  for (const route of routes) {
    const key = keyFn(route);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(route);
  }

  return Array.from(map.entries()).map(([key, routes]) => ({
    key,
    label: key,
    routes,
  }));
}
