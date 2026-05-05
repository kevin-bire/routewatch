import { Request, Response, NextFunction, Router } from 'express';
import {
  setRouteCors,
  getRouteCors,
  removeRouteCors,
  getAllCorsPolicies,
  applyCorsPolicyHeaders,
  CorsPolicy,
} from '../core/routeCors';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.path;
  const origin = req.headers.origin ?? '';
  const headers = applyCorsPolicyHeaders(method, path, origin);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  if (req.method === 'OPTIONS' && Object.keys(headers).length > 0) {
    res.status(204).end();
    return;
  }
  next();
}

export function createCorsListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllCorsPolicies());
  };
}

export function createGetCorsHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const policy = getRouteCors(method, decodeURIComponent(path));
    if (!policy) {
      res.status(404).json({ error: 'No CORS policy found for this route' });
      return;
    }
    res.json(policy);
  };
}

export function createSetCorsHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const policy: CorsPolicy = req.body;
    if (!policy || !Array.isArray(policy.origins)) {
      res.status(400).json({ error: 'Invalid CORS policy: origins array required' });
      return;
    }
    setRouteCors(method, decodeURIComponent(path), policy);
    res.status(201).json({ message: 'CORS policy set', method, path: decodeURIComponent(path) });
  };
}

export function createRemoveCorsHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const removed = removeRouteCors(method, decodeURIComponent(path));
    if (!removed) {
      res.status(404).json({ error: 'No CORS policy found for this route' });
      return;
    }
    res.json({ message: 'CORS policy removed' });
  };
}

export function registerCorsRoutes(router: Router): void {
  router.get('/routewatch/cors', createCorsListHandler());
  router.get('/routewatch/cors/:method/*path', createGetCorsHandler());
  router.post('/routewatch/cors/:method/*path', createSetCorsHandler());
  router.delete('/routewatch/cors/:method/*path', createRemoveCorsHandler());
}
