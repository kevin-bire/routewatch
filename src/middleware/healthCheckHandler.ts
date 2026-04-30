import type { Request, Response, Express } from 'express';
import {
  recordHealth,
  getRouteHealth,
  getAllHealthChecks,
  removeRouteHealth,
  summarizeHealth,
} from '../core/routeHealthCheck';

export function createHealthListHandler() {
  return (_req: Request, res: Response): void => {
    res.json({ checks: getAllHealthChecks(), summary: summarizeHealth() });
  };
}

export function createGetHealthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const entry = getRouteHealth(method, path);
    if (!entry) {
      res.status(404).json({ error: 'No health record found for this route' });
      return;
    }
    res.json(entry);
  };
}

export function createRecordHealthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, status, latencyMs, notes } = req.body as {
      method?: string;
      path?: string;
      status?: 'healthy' | 'degraded' | 'unknown';
      latencyMs?: number;
      notes?: string;
    };
    if (!method || !path || !status) {
      res.status(400).json({ error: 'method, path, and status are required' });
      return;
    }
    const entry = recordHealth(method, path, status, latencyMs ?? null, notes);
    res.status(201).json(entry);
  };
}

export function createRemoveHealthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const removed = removeRouteHealth(method, path);
    if (!removed) {
      res.status(404).json({ error: 'No health record found for this route' });
      return;
    }
    res.json({ success: true });
  };
}

export function registerHealthCheckRoutes(app: Express, basePath = '/__routewatch'): void {
  app.get(`${basePath}/health`, createHealthListHandler());
  app.get(`${basePath}/health/route`, createGetHealthHandler());
  app.post(`${basePath}/health`, createRecordHealthHandler());
  app.delete(`${basePath}/health`, createRemoveHealthHandler());
}
