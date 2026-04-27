/**
 * routeTagger.ts
 * Utilities for auto-tagging routes based on path segments and metadata.
 */

import { RouteDefinition } from './routeCollector';

export interface TagRule {
  pattern: RegExp | string;
  tag: string;
}

const DEFAULT_RULES: TagRule[] = [
  { pattern: /^\/auth/, tag: 'Authentication' },
  { pattern: /^\/user/, tag: 'Users' },
  { pattern: /^\/admin/, tag: 'Admin' },
  { pattern: /^\/health/, tag: 'Health' },
];

/**
 * Derive a tag from the first meaningful path segment.
 */
export function deriveTagFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return 'General';
  const first = segments[0].replace(/[{}]/g, '');
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * Apply a list of tag rules to a route, returning matched tags.
 */
export function applyTagRules(route: RouteDefinition, rules: TagRule[] = DEFAULT_RULES): string[] {
  const matched: string[] = [];
  for (const rule of rules) {
    const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
    if (regex.test(route.path)) {
      matched.push(rule.tag);
    }
  }
  return matched;
}

/**
 * Auto-tag a single route: merges existing tags with rule-based and path-derived tags.
 */
export function autoTagRoute(
  route: RouteDefinition,
  rules: TagRule[] = DEFAULT_RULES
): RouteDefinition {
  const existing = route.tags ?? [];
  const ruleTags = applyTagRules(route, rules);
  const derived = ruleTags.length === 0 ? [deriveTagFromPath(route.path)] : ruleTags;
  const merged = Array.from(new Set([...existing, ...derived]));
  return { ...route, tags: merged };
}

/**
 * Auto-tag an array of routes.
 */
export function autoTagRoutes(
  routes: RouteDefinition[],
  rules: TagRule[] = DEFAULT_RULES
): RouteDefinition[] {
  return routes.map((r) => autoTagRoute(r, rules));
}
