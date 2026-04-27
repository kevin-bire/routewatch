import { Request, Response, NextFunction, Router } from 'express';
import { getRoutes } from '../core/routeCollector';
import {
  groupRoutesByVersion,
  getLatestVersion,
  markDeprecatedRoutes,
} from '../core/routeVersioning';

export function createVersionHandler() {
  return (_req: Request, res: Response) => {
    const routes = getRoutes();
    const grouped = groupRoutesByVersion(routes);
    const versions = Array.from(grouped.keys()).filter((v) => v !== 'unversioned');
    const latest = getLatestVersion(versions);

    const summary: Record<string, { count: number; latest: boolean }> = {};
    for (const [version, vRoutes] of grouped.entries()) {
      if (version === 'unversioned') continue;
      summary[`v${version}`] = {
        count: vRoutes.length,
        latest: version === latest,
      };
    }

    res.json({
      versions: summary,
      latestVersion: latest ? `v${latest}` : null,
      unversionedCount: grouped.get('unversioned')?.length ?? 0,
    });
  };
}

export function createDeprecationHandler() {
  return (_req: Request, res: Response) => {
    const routes = getRoutes();
    const grouped = groupRoutesByVersion(routes);
    const versions = Array.from(grouped.keys()).filter((v) => v !== 'unversioned');
    const latest = getLatestVersion(versions);

    if (!latest) {
      return res.json({ deprecated: [] });
    }

    const allRoutes = routes.map((r) => ({ ...r }));
    const marked = markDeprecatedRoutes(allRoutes, latest);
    const deprecated = marked.filter((r) => r.deprecated);

    res.json({ deprecated, latestVersion: `v${latest}` });
  };
}

export function registerVersionRoutes(router: Router, basePath = '/__routewatch') {
  router.get(`${basePath}/versions`, createVersionHandler());
  router.get(`${basePath}/deprecated`, createDeprecationHandler());
}
