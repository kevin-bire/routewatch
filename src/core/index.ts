/**
 * @module routewatch/core
 * Core exports for route registration, OpenAPI spec generation, and spec caching.
 */

export { registerRoute, getRoutes, clearRoutes } from './routeCollector';
export type { RouteDefinition } from './routeCollector';
export { buildOpenAPISpec } from './schemaBuilder';
export type { RouteSchema, RouteParam, OpenAPISpec } from './schemaBuilder';
export {
  getCache,
  setCache,
  clearCache,
  invalidateCache,
  isCacheDirty,
} from './specCache';
