import type { Request, Response, NextFunction, Router } from 'express';
import {
  setCache,
  getCache,
  removeCache,
  getAllCachePolicies,
  getCacheHeaders,
  isCacheEnabled,
  type CachePolicy,
} from '../core/routeCache';

/**
 * Middleware that injects Cache-Control headers based on stored policies.
 */
export function cacheHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.path;
  if (isCacheEnabled(method, path)) {
    const headers = getCacheHeaders(method, path);
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }
  next();
}

export function createCacheListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllCachePolicies());
  };
}

export function createGetCacheHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const policy = getCache(method.toUpperCase(), `/${path}`);
    if (!policy) {
      res.status(404).json({ error: 'No cache policy found for this route' });
      return;
    }
    res.json(policy);
  };
}

export function createSetCacheHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const policy: CachePolicy = req.body;
    if (typeof policy.ttl !== 'number') {
      res.status(400).json({ error: '"ttl" (number) is required' });
      return;
    }
    setCache(method.toUpperCase(), `/${path}`, policy);
    res.status(201).json({ message: 'Cache policy set', policy });
  };
}

export function createRemoveCacheHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const removed = removeCache(method.toUpperCase(), `/${path}`);
    if (!removed) {
      res.status(404).json({ error: 'No cache policy found' });
      return;
    }
    res.json({ message: 'Cache policy removed' });
  };
}

export function registerCacheRoutes(router: Router): void {
  router.get('/__routewatch/cache', createCacheListHandler());
  router.get('/__routewatch/cache/:method/*path', createGetCacheHandler());
  router.post('/__routewatch/cache/:method/*path', createSetCacheHandler());
  router.delete('/__routewatch/cache/:method/*path', createRemoveCacheHandler());
}
