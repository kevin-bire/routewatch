import type { Request, Response, NextFunction, Router } from "express";
import { recordHit, getMetrics } from "../core/routeMetrics";

/**
 * Express middleware that records a hit for every matched route.
 * Attach before your route definitions to capture timing data.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const path = req.route?.path ?? req.path;
    recordHit(req.method, path, duration);
  });

  next();
}

/**
 * Returns an Express request handler that responds with current metrics as JSON.
 */
export function createMetricsHandler() {
  return (_req: Request, res: Response): void => {
    const metrics = getMetrics();
    res.json({
      generatedAt: new Date().toISOString(),
      totalRoutes: metrics.length,
      routes: metrics.map((m) => ({
        method: m.method,
        path: m.path,
        hitCount: m.hitCount,
        lastAccessedAt: m.lastAccessedAt?.toISOString() ?? null,
        avgResponseTimeMs:
          m.avgResponseTimeMs !== null
            ? Math.round(m.avgResponseTimeMs * 100) / 100
            : null,
      })),
    });
  };
}

/**
 * Registers the metrics endpoint on the provided Express router.
 * Default path: GET /__routewatch/metrics
 */
export function registerMetricsRoute(
  router: Router,
  path = "/__routewatch/metrics"
): void {
  router.get(path, createMetricsHandler());
}
