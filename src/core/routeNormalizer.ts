import { RouteDefinition } from './routeCollector';
import { validateRoute } from './routeValidator';

export interface NormalizeOptions {
  strictValidation?: boolean;
  defaultTags?: string[];
}

export class RouteNormalizationError extends Error {
  constructor(
    public readonly route: Partial<RouteDefinition>,
    public readonly validationErrors: string[]
  ) {
    super(`Route normalization failed: ${validationErrors.join(', ')}`);
    this.name = 'RouteNormalizationError';
  }
}

export function normalizeRoute(
  route: Partial<RouteDefinition>,
  options: NormalizeOptions = {}
): RouteDefinition {
  const normalized: RouteDefinition = {
    method: (route.method ?? 'GET').toUpperCase(),
    path: normalizePath(route.path ?? '/'),
    summary: route.summary?.trim(),
    description: route.description?.trim(),
    tags: normalizeTags(route.tags, options.defaultTags),
    params: route.params,
    query: route.query,
    body: route.body,
    responses: route.responses,
  };

  if (options.strictValidation) {
    const result = validateRoute(normalized);
    if (!result.valid) {
      throw new RouteNormalizationError(
        route,
        result.errors.map(e => `${e.field}: ${e.message}`)
      );
    }
  }

  return normalized;
}

export function normalizeRoutes(
  routes: Partial<RouteDefinition>[],
  options: NormalizeOptions = {}
): RouteDefinition[] {
  return routes.map(route => normalizeRoute(route, options));
}

function normalizePath(path: string): string {
  let normalized = path.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  normalized = normalized.replace(/\/+/g, '/');
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function normalizeTags(
  tags: string[] | undefined,
  defaultTags: string[] | undefined
): string[] | undefined {
  if (tags && tags.length > 0) {
    return tags.map(t => t.trim().toLowerCase()).filter(Boolean);
  }
  return defaultTags;
}
