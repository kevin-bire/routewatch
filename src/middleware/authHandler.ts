import { Request, Response, Router } from 'express';
import {
  setRouteAuth,
  getRouteAuth,
  removeRouteAuth,
  getAllRouteAuths,
  AuthConfig,
} from '../core/routeAuth';

export function createAuthListHandler() {
  return (_req: Request, res: Response): void => {
    const auths = getAllRouteAuths();
    res.json({ count: auths.length, routes: auths });
  };
}

export function createGetAuthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path query params are required' });
      return;
    }
    const auth = getRouteAuth(method, path);
    if (!auth) {
      res.status(404).json({ error: 'No auth config found for this route' });
      return;
    }
    res.json({ method, path, auth });
  };
}

export function createSetAuthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, auth } = req.body as {
      method?: string;
      path?: string;
      auth?: AuthConfig;
    };
    if (!method || !path || !auth?.scheme) {
      res.status(400).json({ error: 'method, path, and auth.scheme are required' });
      return;
    }
    setRouteAuth(method, path, auth);
    res.status(201).json({ message: 'Auth config set', method, path, auth });
  };
}

export function createRemoveAuthHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.body as { method?: string; path?: string };
    if (!method || !path) {
      res.status(400).json({ error: 'method and path are required' });
      return;
    }
    const removed = removeRouteAuth(method, path);
    if (!removed) {
      res.status(404).json({ error: 'No auth config found to remove' });
      return;
    }
    res.json({ message: 'Auth config removed', method, path });
  };
}

export function registerAuthRoutes(router: Router): void {
  router.get('/__routewatch/auth', createAuthListHandler());
  router.get('/__routewatch/auth/lookup', createGetAuthHandler());
  router.post('/__routewatch/auth', createSetAuthHandler());
  router.delete('/__routewatch/auth', createRemoveAuthHandler());
}
