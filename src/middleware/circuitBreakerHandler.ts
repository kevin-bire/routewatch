import { Router, Request, Response } from 'express';
import {
  setCircuitBreaker,
  getCircuitBreaker,
  getCircuitState,
  getAllCircuitBreakers,
  removeCircuitBreaker,
  recordFailure,
  recordSuccess,
} from '../core/routeCircuitBreaker';

export function createCircuitBreakerListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllCircuitBreakers());
  };
}

export function createGetCircuitBreakerHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method: string; path: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const entry = getCircuitBreaker(method, path);
    if (!entry) {
      res.status(404).json({ error: 'No circuit breaker found for this route' });
      return;
    }
    res.json({ ...entry, currentState: getCircuitState(method, path) });
  };
}

export function createSetCircuitBreakerHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, threshold, resetTimeout } = req.body as {
      method: string;
      path: string;
      threshold: number;
      resetTimeout: number;
    };
    if (!method || !path || threshold == null || resetTimeout == null) {
      res.status(400).json({ error: 'method, path, threshold, and resetTimeout are required' });
      return;
    }
    setCircuitBreaker(method, path, { threshold, resetTimeout });
    res.status(201).json({ message: 'Circuit breaker configured', method, path });
  };
}

export function createRemoveCircuitBreakerHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method: string; path: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const removed = removeCircuitBreaker(method, path);
    if (!removed) {
      res.status(404).json({ error: 'No circuit breaker found for this route' });
      return;
    }
    res.json({ message: 'Circuit breaker removed', method, path });
  };
}

export function createRecordEventHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, event } = req.body as { method: string; path: string; event: 'failure' | 'success' };
    if (!method || !path || !event) {
      res.status(400).json({ error: 'method, path, and event are required' });
      return;
    }
    if (event === 'failure') {
      const state = recordFailure(method, path);
      res.json({ state });
    } else if (event === 'success') {
      recordSuccess(method, path);
      res.json({ state: getCircuitState(method, path) });
    } else {
      res.status(400).json({ error: 'event must be failure or success' });
    }
  };
}

export function registerCircuitBreakerRoutes(router: Router, basePath = '/__routewatch/circuit-breakers'): void {
  router.get(basePath, createCircuitBreakerListHandler());
  router.get(`${basePath}/one`, createGetCircuitBreakerHandler());
  router.post(basePath, createSetCircuitBreakerHandler());
  router.delete(basePath, createRemoveCircuitBreakerHandler());
  router.post(`${basePath}/event`, createRecordEventHandler());
}
