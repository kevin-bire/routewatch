import { getRoutes } from './routeCollector';
import { buildOpenAPISpec } from './schemaBuilder';
import { isCacheDirty, setCache, getCache } from './specCache';
import type { OpenAPISpec, RouteDefinition } from './index';

export interface SpecGeneratorOptions {
  title?: string;
  version?: string;
  description?: string;
  serverUrl?: string;
}

const DEFAULT_OPTIONS: Required<SpecGeneratorOptions> = {
  title: 'API Documentation',
  version: '1.0.0',
  description: '',
  serverUrl: 'http://localhost:3000',
};

/**
 * Generates (or returns cached) OpenAPI spec from registered routes.
 * Rebuilds only when the cache has been invalidated.
 */
export function generateSpec(options: SpecGeneratorOptions = {}): OpenAPISpec {
  const cached = getCache();
  if (cached && !isCacheDirty()) {
    return cached;
  }

  const mergedOptions: Required<SpecGeneratorOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const routes: RouteDefinition[] = getRoutes();
  const spec = buildOpenAPISpec(routes, {
    title: mergedOptions.title,
    version: mergedOptions.version,
    description: mergedOptions.description,
    servers: [{ url: mergedOptions.serverUrl }],
  });

  setCache(spec);
  return spec;
}

/**
 * Returns the spec as a formatted JSON string.
 */
export function generateSpecJSON(options: SpecGeneratorOptions = {}): string {
  return JSON.stringify(generateSpec(options), null, 2);
}
