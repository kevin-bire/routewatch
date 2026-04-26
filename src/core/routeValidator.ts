import { RouteDefinition } from './routeCollector';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const PATH_PARAM_REGEX = /^:[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateRoute(route: RouteDefinition): ValidationResult {
  const errors: ValidationError[] = [];

  if (!route.method || typeof route.method !== 'string') {
    errors.push({ field: 'method', message: 'Method is required and must be a string' });
  } else if (!VALID_METHODS.includes(route.method.toUpperCase())) {
    errors.push({ field: 'method', message: `Invalid HTTP method: ${route.method}` });
  }

  if (!route.path || typeof route.path !== 'string') {
    errors.push({ field: 'path', message: 'Path is required and must be a string' });
  } else if (!route.path.startsWith('/')) {
    errors.push({ field: 'path', message: 'Path must start with a forward slash' });
  } else {
    const segments = route.path.split('/').filter(Boolean);
    for (const segment of segments) {
      if (segment.startsWith(':') && !PATH_PARAM_REGEX.test(segment)) {
        errors.push({
          field: 'path',
          message: `Invalid path parameter format: ${segment}`,
        });
      }
    }
  }

  if (route.tags && !Array.isArray(route.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array of strings' });
  }

  if (route.summary && typeof route.summary !== 'string') {
    errors.push({ field: 'summary', message: 'Summary must be a string' });
  }

  if (route.description && typeof route.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  return { valid: errors.length === 0, errors };
}

export function validateRoutes(routes: RouteDefinition[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();
  for (const route of routes) {
    const key = `${route.method?.toUpperCase()} ${route.path}`;
    results.set(key, validateRoute(route));
  }
  return results;
}
