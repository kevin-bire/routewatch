import type { Request, Response, NextFunction, Router } from 'express';
import {
  setCompression,
  getCompression,
  removeCompression,
  getAllCompressionPolicies,
  clearCompressionPolicies,
  getEffectiveEncodings,
  type CompressionPolicy,
} from '../core/routeCompression';

/**
 * Middleware that sets Accept-Encoding-aware response headers based on stored policy.
 */
export function compressionPolicyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const method = req.method;
  const path = req.path;
  const encodings = getEffectiveEncodings(method, path);
  res.setHeader('X-Compression-Encodings', encodings.join(', '));
  next();
}

export function createCompressionListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllCompressionPolicies());
  };
}

export function createGetCompressionHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const decodedPath = decodeURIComponent(path);
    const policy = getCompression(method, decodedPath);
    if (!policy) {
      res.status(404).json({ error: 'Compression policy not found' });
      return;
    }
    res.json({ method, path: decodedPath, policy });
  };
}

export function createSetCompressionHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const decodedPath = decodeURIComponent(path);
    const policy = req.body as CompressionPolicy;
    if (!policy || typeof policy.enabled !== 'boolean' || !Array.isArray(policy.encodings)) {
      res.status(400).json({ error: 'Invalid compression policy' });
      return;
    }
    setCompression(method, decodedPath, policy);
    res.status(201).json({ method, path: decodedPath, policy });
  };
}

export function createRemoveCompressionHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params as { method: string; path: string };
    const decodedPath = decodeURIComponent(path);
    const removed = removeCompression(method, decodedPath);
    if (!removed) {
      res.status(404).json({ error: 'Compression policy not found' });
      return;
    }
    res.status(204).send();
  };
}

export function createClearCompressionHandler() {
  return (_req: Request, res: Response): void => {
    clearCompressionPolicies();
    res.status(204).send();
  };
}

export function registerCompressionRoutes(router: Router): void {
  router.get('/routewatch/compression', createCompressionListHandler());
  router.get('/routewatch/compression/:method/:path', createGetCompressionHandler());
  router.post('/routewatch/compression/:method/:path', createSetCompressionHandler());
  router.delete('/routewatch/compression/:method/:path', createRemoveCompressionHandler());
  router.delete('/routewatch/compression', createClearCompressionHandler());
}
