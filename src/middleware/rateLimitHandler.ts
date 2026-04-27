import { Request, Response, NextFunction, Router } from 'express';
import {
  setRateLimit,
  getRateLimit,
  getAllRateLimits,
  removeRateLimit,
} from '../core/routeRateLimiter';

export function createRateLimitListHandler() {
  return (_req: Request, res: Response) => {
    const limits = getAllRateLimits();
    res.json({ rateLimits: limits });
  };
}

export function createSetRateLimitHandler() {
  return (req: Request, res: Response) => {
    const { method, path: routePath, maxRequests, windowMs } = req.body as {
      method: string;
      path: string;
      maxRequests: number;
      windowMs: number;
    };

    if (!method || !routePath || maxRequests == null || windowMs == null) {
      res.status(400).json({ error: 'method, path, maxRequests, and windowMs are required' });
      return;
    }

    if (typeof maxRequests !== 'number' || maxRequests <= 0) {
      res.status(400).json({ error: 'maxRequests must be a positive number' });
      return;
    }

    if (typeof windowMs !== 'number' || windowMs <= 0) {
      res.status(400).json({ error: 'windowMs must be a positive number' });
      return;
    }

    setRateLimit(method, routePath, { maxRequests, windowMs });
    const saved = getRateLimit(method, routePath);
    res.status(201).json({ rateLimit: saved });
  };
}

export function createRemoveRateLimitHandler() {
  return (req: Request, res: Response) => {
    const { method, path: routePath } = req.query as { method: string; path: string };

    if (!method || !routePath) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }

    removeRateLimit(method, routePath);
    res.json({ removed: true, method, path: routePath });
  };
}

export function registerRateLimitRoutes(router: Router): void {
  router.get('/routewatch/rate-limits', createRateLimitListHandler());
  router.post('/routewatch/rate-limits', createSetRateLimitHandler());
  router.delete('/routewatch/rate-limits', createRemoveRateLimitHandler());
}
