/**
 * taggerHandler.ts
 * Express middleware/route that applies auto-tagging to registered routes
 * and exposes a preview endpoint.
 */

import { Request, Response, Router } from 'express';
import { getRoutes } from '../core/routeCollector';
import { autoTagRoutes, TagRule } from '../core/routeTagger';

export interface TaggerHandlerOptions {
  /** Custom tag rules; falls back to defaults when omitted. */
  rules?: TagRule[];
  /** Base path for the tagger endpoint (default: /__routewatch/tags) */
  basePath?: string;
}

/**
 * Returns an Express handler that responds with auto-tagged route previews.
 */
export function createTaggerHandler(options: TaggerHandlerOptions = {}) {
  return (_req: Request, res: Response): void => {
    const routes = getRoutes();
    const tagged = autoTagRoutes(routes, options.rules);
    res.json({
      count: tagged.length,
      routes: tagged.map((r) => ({
        method: r.method,
        path: r.path,
        tags: r.tags ?? [],
      })),
    });
  };
}

/**
 * Registers the tagger preview route on an Express Router.
 *
 * GET  <basePath>          → list all routes with auto-applied tags
 * POST <basePath>/apply    → not mutating; returns what tags would be applied
 */
export function registerTaggerRoutes(
  router: Router,
  options: TaggerHandlerOptions = {}
): void {
  const base = options.basePath ?? '/__routewatch/tags';

  router.get(base, createTaggerHandler(options));

  router.post(`${base}/apply`, (req: Request, res: Response) => {
    const body: { path?: string; method?: string } = req.body ?? {};
    const routes = getRoutes();
    const match = routes.find(
      (r) =>
        r.path === body.path &&
        r.method.toUpperCase() === (body.method ?? '').toUpperCase()
    );
    if (!match) {
      res.status(404).json({ error: 'Route not found' });
      return;
    }
    const { autoTagRoute } = require('../core/routeTagger');
    const tagged = autoTagRoute(match, options.rules);
    res.json({ method: tagged.method, path: tagged.path, tags: tagged.tags ?? [] });
  });
}
