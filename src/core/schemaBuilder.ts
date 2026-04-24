export interface RouteParam {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description?: string;
}

export interface RouteSchema {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  params?: RouteParam[];
  requestBody?: Record<string, unknown>;
  responses?: Record<number, { description: string; schema?: Record<string, unknown> }>;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, unknown>>;
}

export function buildOpenAPISpec(
  routes: RouteSchema[],
  info: { title: string; version: string; description?: string }
): OpenAPISpec {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of routes) {
    const openApiPath = route.path.replace(/:([a-zA-Z_]+)/g, '{$1}');
    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const operation: Record<string, unknown> = {
      summary: route.summary ?? `${route.method.toUpperCase()} ${route.path}`,
      description: route.description,
      tags: route.tags ?? [],
      parameters: (route.params ?? [])
        .filter((p) => p.in !== 'body')
        .map((p) => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type },
          description: p.description,
        })),
      responses: route.responses ?? { 200: { description: 'OK' } },
    };

    if (route.requestBody) {
      operation.requestBody = {
        content: { 'application/json': { schema: route.requestBody } },
      };
    }

    paths[openApiPath][route.method.toLowerCase()] = operation;
  }

  return { openapi: '3.0.3', info, paths };
}
