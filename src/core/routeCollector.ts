export interface RouteDefinition {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  responses?: Record<string, ResponseDefinition>;
  internal?: boolean;
}

export interface ParameterDefinition {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema?: Record<string, unknown>;
  description?: string;
}

export interface RequestBodyDefinition {
  description?: string;
  required?: boolean;
  schema?: Record<string, unknown>;
}

export interface ResponseDefinition {
  description: string;
  schema?: Record<string, unknown>;
}

const routes: RouteDefinition[] = [];

export function registerRoute(route: RouteDefinition): void {
  const exists = routes.some(
    (r) => r.method === route.method && r.path === route.path
  );
  if (!exists) {
    routes.push(route);
  }
}

export function getRoutes(): RouteDefinition[] {
  return [...routes];
}

export function clearRoutes(): void {
  routes.length = 0;
}
