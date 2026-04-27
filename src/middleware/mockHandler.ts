/**
 * mockHandler.ts
 * Express middleware and route handlers for managing and serving route mocks.
 */

import { Request, Response, NextFunction, Router } from 'express';
import {
  setMock,
  getMock,
  removeMock,
  getAllMocks,
  hasMock,
  MockConfig,
} from '../core/routeMocking';

/**
 * Middleware that intercepts requests and serves mock responses when configured.
 */
export function mockInterceptorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const mock = getMock(req.method, req.path);
  if (!mock) return next();

  const respond = () => {
    if (mock.headers) {
      Object.entries(mock.headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    res.status(mock.statusCode).json(mock.body);
  };

  if (mock.delay && mock.delay > 0) {
    setTimeout(respond, mock.delay);
  } else {
    respond();
  }
}

export function createMockListHandler() {
  return (_req: Request, res: Response) => {
    res.json(getAllMocks());
  };
}

export function createSetMockHandler() {
  return (req: Request, res: Response) => {
    const { method, path: routePath } = req.params as Record<string, string>;
    const config = req.body as MockConfig;
    if (!config || typeof config.statusCode !== 'number') {
      return res.status(400).json({ error: 'Invalid mock config' });
    }
    setMock(method, `/${routePath}`, config);
    res.status(201).json({ message: 'Mock set', method, path: `/${routePath}` });
  };
}

export function createRemoveMockHandler() {
  return (req: Request, res: Response) => {
    const { method, path: routePath } = req.params as Record<string, string>;
    const removed = removeMock(method, `/${routePath}`);
    if (!removed) return res.status(404).json({ error: 'Mock not found' });
    res.json({ message: 'Mock removed' });
  };
}

export function registerMockRoutes(router: Router): void {
  router.get('/__routewatch/mocks', createMockListHandler());
  router.post('/__routewatch/mocks/:method/*path', createSetMockHandler());
  router.delete('/__routewatch/mocks/:method/*path', createRemoveMockHandler());
}
