import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { registerRoute } from '../core/routeCollector';
import { generateSpec, generateSpecJSON } from '../core/specGenerator';
import { RouteDefinition } from '../core/index';

export interface RouteWatchFastifyOptions extends FastifyPluginOptions {
  /** The path to serve the Swagger UI (default: '/docs') */
  docsPath?: string;
  /** The path to serve the raw OpenAPI JSON spec (default: '/docs/openapi.json') */
  specPath?: string;
  /** OpenAPI info block overrides */
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
}

/**
 * Renders a minimal Swagger UI HTML page pointing at the given spec URL.
 */
function renderSwaggerUI(specUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>RouteWatch API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout'
    });
  </script>
</body>
</html>`;
}

/**
 * Registers a route definition into the RouteWatch collector.
 * Call this after adding routes to your Fastify instance if you want
 * them reflected in the generated spec.
 */
export function watch(route: RouteDefinition): void {
  registerRoute(route);
}

/**
 * Fastify plugin that:
 *  1. Intercepts route registrations to collect route metadata.
 *  2. Serves live OpenAPI JSON at `specPath`.
 *  3. Serves Swagger UI at `docsPath`.
 *
 * @example
 * import Fastify from 'fastify';
 * import { routeWatchPlugin } from 'routewatch';
 *
 * const app = Fastify();
 * app.register(routeWatchPlugin, { docsPath: '/docs' });
 */
export async function routeWatchPlugin(
  fastify: FastifyInstance,
  options: RouteWatchFastifyOptions
): Promise<void> {
  const docsPath = options.docsPath ?? '/docs';
  const specPath = options.specPath ?? `${docsPath}/openapi.json`;
  const infoOverrides = options.info ?? {};

  // Hook into route registration to automatically collect route metadata
  fastify.addHook('onRoute', (routeOptions) => {
    // Skip internal RouteWatch documentation routes
    if (
      routeOptions.url === docsPath ||
      routeOptions.url === specPath
    ) {
      return;
    }

    const method = Array.isArray(routeOptions.method)
      ? routeOptions.method[0]
      : routeOptions.method;

    registerRoute({
      method: method as RouteDefinition['method'],
      path: routeOptions.url,
      summary: (routeOptions.config as Record<string, unknown>)?.summary as string | undefined,
      description: (routeOptions.config as Record<string, unknown>)?.description as string | undefined,
      tags: (routeOptions.config as Record<string, unknown>)?.tags as string[] | undefined,
    });
  });

  // Serve the raw OpenAPI JSON spec
  fastify.get(specPath, async (_request: FastifyRequest, reply: FastifyReply) => {
    const spec = generateSpec(infoOverrides);
    reply.header('Content-Type', 'application/json').send(spec);
  });

  // Serve the Swagger UI
  fastify.get(docsPath, async (_request: FastifyRequest, reply: FastifyReply) => {
    const html = renderSwaggerUI(specPath);
    reply.header('Content-Type', 'text/html').send(html);
  });
}
