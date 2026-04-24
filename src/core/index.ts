/**
 * routewatch core module
 *
 * Exports the public API for route collection.
 * Consumers import from here rather than internal files.
 */
export type { RouteDefinition } from './routeCollector';
export {
  registerRoute,
  getRoutes,
  clearRoutes,
} from './routeCollector';
