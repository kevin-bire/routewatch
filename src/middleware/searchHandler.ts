import { Request, Response } from 'express';
import { getRoutes } from '../core/routeCollector';
import { searchRoutes, extractSearchQuery } from '../core/routeSearch';
import { normalizeRoutes } from '../core/routeNormalizer';
import { validateRoutes } from '../core/routeValidator';

export interface SearchHandlerOptions {
  basePath?: string;
  caseSensitive?: boolean;
}

export function createSearchHandler(options: SearchHandlerOptions = {}) {
  return function searchHandler(req: Request, res: Response): void {
    const query = extractSearchQuery(req.query.q);
    const fields = req.query.fields
      ? String(req.query.fields).split(',') as any[]
      : undefined;

    const raw = getRoutes();
    const normalized = normalizeRoutes(raw);
    const { valid } = validateRoutes(normalized);

    const results = searchRoutes(valid, {
      query,
      fields,
      caseSensitive: options.caseSensitive ?? false,
    });

    res.json({
      query,
      total: results.length,
      results: results.map(r => ({
        route: r.route,
        matchedFields: r.matchedFields,
        score: r.score,
      })),
    });
  };
}

export function registerSearchRoute(
  app: { get: (path: string, handler: (req: Request, res: Response) => void) => void },
  options: SearchHandlerOptions & { path?: string } = {}
): void {
  const routePath = options.path ?? '/_routewatch/search';
  app.get(routePath, createSearchHandler(options));
}
