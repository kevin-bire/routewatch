import { Request, Response, NextFunction, Router } from 'express';
import {
  markDeprecated,
  getAllDeprecations,
  getDeprecation,
  isDeprecated,
  DeprecationEntry,
} from '../core/routeDeprecation';

export function deprecationWarningMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const method = req.method;
  const path = req.path;

  if (isDeprecated(method, path)) {
    const entry = getDeprecation(method, path)!;
    res.setHeader('Deprecation', entry.deprecatedAt);
    if (entry.sunset) {
      res.setHeader('Sunset', entry.sunset);
    }
    if (entry.replacement) {
      res.setHeader('Link', `<${entry.replacement}>; rel="successor-version"`);
    }
  }

  next();
}

export function createDeprecationListHandler() {
  return (_req: Request, res: Response): void => {
    const deprecations: DeprecationEntry[] = getAllDeprecations();
    res.json({ total: deprecations.length, deprecations });
  };
}

export function createMarkDeprecatedHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, sunset, replacement, reason } = req.body ?? {};

    if (!method || !path) {
      res.status(400).json({ error: 'method and path are required' });
      return;
    }

    const entry = markDeprecated(method, path, { sunset, replacement, reason });
    res.status(201).json(entry);
  };
}

export function registerDeprecationRoutes(router: Router): void {
  router.get('/_routewatch/deprecations', createDeprecationListHandler());
  router.post('/_routewatch/deprecations', createMarkDeprecatedHandler());
}
