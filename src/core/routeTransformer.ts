/**
 * routeTransformer.ts
 *
 * Provides utilities for transforming route definitions — renaming fields,
 * remapping paths, converting between formats, and applying bulk
 * transformations to route collections.
 */

import { RouteDefinition } from './routeCollector';

export type TransformFn = (route: RouteDefinition) => RouteDefinition;

export interface TransformPipeline {
  steps: TransformFn[];
}

/**
 * Apply a single transform function to a route.
 */
export function applyTransform(
  route: RouteDefinition,
  fn: TransformFn
): RouteDefinition {
  return fn({ ...route });
}

/**
 * Apply a pipeline of transforms to a route in order.
 */
export function applyPipeline(
  route: RouteDefinition,
  pipeline: TransformPipeline
): RouteDefinition {
  return pipeline.steps.reduce(
    (current, fn) => applyTransform(current, fn),
    { ...route }
  );
}

/**
 * Apply a pipeline of transforms to an array of routes.
 */
export function transformRoutes(
  routes: RouteDefinition[],
  pipeline: TransformPipeline
): RouteDefinition[] {
  return routes.map((route) => applyPipeline(route, pipeline));
}

/**
 * Built-in transform: prefix all route paths with a given string.
 *
 * Example: prefixPath('/api/v1') turns '/users' into '/api/v1/users'
 */
export function prefixPath(prefix: string): TransformFn {
  return (route) => ({
    ...route,
    path: `/${prefix.replace(/^\/+|\/+$/g, '')}/${route.path.replace(/^\/+/, '')}`,
  });
}

/**
 * Built-in transform: force all methods to uppercase.
 */
export function uppercaseMethod(): TransformFn {
  return (route) => ({
    ...route,
    method: route.method.toUpperCase() as RouteDefinition['method'],
  });
}

/**
 * Built-in transform: append additional tags to a route.
 */
export function appendTags(tags: string[]): TransformFn {
  return (route) => ({
    ...route,
    tags: Array.from(new Set([...(route.tags ?? []), ...tags])),
  });
}

/**
 * Built-in transform: override or set the summary field.
 */
export function setSummary(summary: string): TransformFn {
  return (route) => ({ ...route, summary });
}

/**
 * Built-in transform: mark all routes as deprecated.
 */
export function markAllDeprecated(): TransformFn {
  return (route) => ({ ...route, deprecated: true });
}

/**
 * Create a reusable pipeline from an array of transform functions.
 */
export function createPipeline(...steps: TransformFn[]): TransformPipeline {
  return { steps };
}
