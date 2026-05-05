import { Request, Response, NextFunction, Router } from 'express';
import {
  setThrottle,
  getThrottle,
  removeThrottle,
  getAllThrottles,
  checkThrottle,
  ThrottlePolicy,
} from '../core/routeThrottle';

export function throttleMiddleware(req: Request, res: Response, next: NextFunction): void {
  const result = checkThrottle(req.method, req.path);
  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil((result.retryAfterMs ?? 1000) / 1000));
    res.status(429).json({ error: 'Too Many Requests', retryAfterMs: result.retryAfterMs });
    return;
  }
  next();
}

export function createThrottleListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllThrottles());
  };
}

export function createGetThrottleHandler() {
  return (req: Request, res: Response): void => {
    const { method, path: routePath } = req.params;
    const policy = getThrottle(method, `/${routePath}`);
    if (!policy) {
      res.status(404).json({ error: 'No throttle policy found' });
      return;
    }
    res.json(policy);
  };
}

export function createSetThrottleHandler() {
  return (req: Request, res: Response): void => {
    const { method, path: routePath } = req.params;
    const policy: ThrottlePolicy = req.body;
    if (!policy.requestsPerWindow || !policy.windowMs) {
      res.status(400).json({ error: 'requestsPerWindow and windowMs are required' });
      return;
    }
    setThrottle(method, `/${routePath}`, policy);
    res.status(201).json({ message: 'Throttle policy set', policy });
  };
}

export function createRemoveThrottleHandler() {
  return (req: Request, res: Response): void => {
    const { method, path: routePath } = req.params;
    const removed = removeThrottle(method, `/${routePath}`);
    if (!removed) {
      res.status(404).json({ error: 'Throttle policy not found' });
      return;
    }
    res.json({ message: 'Throttle policy removed' });
  };
}

export function registerThrottleRoutes(router: Router): void {
  router.get('/__routewatch/throttles', createThrottleListHandler());
  router.get('/__routewatch/throttles/:method/*path', createGetThrottleHandler());
  router.post('/__routewatch/throttles/:method/*path', createSetThrottleHandler());
  router.delete('/__routewatch/throttles/:method/*path', createRemoveThrottleHandler());
}
