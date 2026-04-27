import type { Request, Response, Router } from 'express';
import {
  setRouteEnvironments,
  getRouteEnvironments,
  removeRouteEnvironments,
  getAllRouteEnvironments,
  filterRoutesByEnvironment,
  Environment,
} from '../core/routeEnvironment';
import { getRoutes } from '../core/routeCollector';

export function createEnvironmentListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllRouteEnvironments());
  };
}

export function createGetEnvironmentHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const envs = getRouteEnvironments(method, path);
    if (!envs) {
      res.status(404).json({ error: 'No environment restriction found for this route' });
      return;
    }
    res.json({ method: method.toUpperCase(), path, environments: envs });
  };
}

export function createSetEnvironmentHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, environments } = req.body as {
      method?: string;
      path?: string;
      environments?: Environment[];
    };
    if (!method || !path || !Array.isArray(environments) || environments.length === 0) {
      res.status(400).json({ error: 'method, path, and a non-empty environments array are required' });
      return;
    }
    setRouteEnvironments(method, path, environments);
    res.status(201).json({ method: method.toUpperCase(), path, environments });
  };
}

export function createRemoveEnvironmentHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const removed = removeRouteEnvironments(method, path);
    if (!removed) {
      res.status(404).json({ error: 'No environment restriction found for this route' });
      return;
    }
    res.json({ removed: true });
  };
}

export function createFilteredRoutesHandler() {
  return (req: Request, res: Response): void => {
    const { env } = req.query as { env?: string };
    if (!env) {
      res.status(400).json({ error: 'env query param is required' });
      return;
    }
    const allRoutes = getRoutes();
    const filtered = filterRoutesByEnvironment(allRoutes, env);
    res.json(filtered);
  };
}

export function registerEnvironmentRoutes(router: Router): void {
  router.get('/routewatch/environments', createEnvironmentListHandler());
  router.get('/routewatch/environments/filter', createFilteredRoutesHandler());
  router.get('/routewatch/environments/route', createGetEnvironmentHandler());
  router.post('/routewatch/environments/route', createSetEnvironmentHandler());
  router.delete('/routewatch/environments/route', createRemoveEnvironmentHandler());
}
