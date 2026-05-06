import { Request, Response, NextFunction, Router } from 'express';
import {
  recordTrace,
  getTraces,
  getAllTraces,
  clearTraces,
  generateTraceId,
} from '../core/routeTracing';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const traceId = generateTraceId();
  const startedAt = Date.now();
  (req as any).traceId = traceId;

  res.on('finish', () => {
    recordTrace({
      traceId,
      method: req.method,
      path: req.route?.path ?? req.path,
      startedAt,
      duration: Date.now() - startedAt,
      statusCode: res.statusCode,
    });
  });

  next();
}

export function createTraceListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllTraces());
  };
}

export function createGetTraceHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method: string; path: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params required' });
      return;
    }
    res.json(getTraces(method, path));
  };
}

export function createClearTraceHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    clearTraces(method, path);
    res.json({ cleared: true });
  };
}

export function registerTracingRoutes(router: Router): void {
  router.get('/routewatch/traces', createTraceListHandler());
  router.get('/routewatch/traces/route', createGetTraceHandler());
  router.delete('/routewatch/traces', createClearTraceHandler());
}
