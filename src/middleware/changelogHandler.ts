import { Request, Response, Router } from 'express';
import { getChangelog, recordChanges, takeSnapshot } from '../core/routeChangelog';
import { getRoutes } from '../core/routeCollector';

export function createChangelogHandler() {
  return (_req: Request, res: Response): void => {
    const changelog = getChangelog();
    res.json({
      total: changelog.length,
      entries: changelog.map((entry) => ({
        timestamp: entry.timestamp,
        changeType: entry.changeType,
        method: entry.route.method,
        path: entry.route.path,
        summary: entry.route.summary,
        previous: entry.previousRoute
          ? {
              method: entry.previousRoute.method,
              path: entry.previousRoute.path,
              summary: entry.previousRoute.summary,
            }
          : undefined,
      })),
    });
  };
}

export function createSnapshotHandler() {
  return (_req: Request, res: Response): void => {
    const routes = getRoutes();
    const changes = recordChanges(routes);
    res.json({
      snapshotTaken: true,
      changesDetected: changes.length,
      changes: changes.map((e) => ({
        changeType: e.changeType,
        method: e.route.method,
        path: e.route.path,
      })),
    });
  };
}

export function registerChangelogRoutes(router: Router, basePath = '/_routewatch'): void {
  takeSnapshot(getRoutes());
  router.get(`${basePath}/changelog`, createChangelogHandler());
  router.post(`${basePath}/changelog/snapshot`, createSnapshotHandler());
}
