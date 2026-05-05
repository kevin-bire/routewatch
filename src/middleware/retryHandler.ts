/**
 * retryHandler.ts
 * Express route handlers for managing route retry policies via the RouteWatch API.
 */

import { Request, Response, Router } from "express";
import {
  setRetryPolicy,
  getRetryPolicy,
  removeRetryPolicy,
  getAllRetryPolicies,
  RetryPolicy,
} from "../core/routeRetry";

export function createRetryListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllRetryPolicies());
  };
}

export function createGetRetryHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const policy = getRetryPolicy(method, decodeURIComponent(path));
    if (!policy) {
      res.status(404).json({ error: "No retry policy found for this route" });
      return;
    }
    res.json(policy);
  };
}

export function createSetRetryHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const { maxAttempts, backoffMs, retryOn } = req.body as Partial<RetryPolicy>;

    if (maxAttempts === undefined || backoffMs === undefined) {
      res.status(400).json({ error: "maxAttempts and backoffMs are required" });
      return;
    }

    try {
      setRetryPolicy(method, decodeURIComponent(path), {
        maxAttempts,
        backoffMs,
        retryOn,
      });
      res.status(200).json({ message: "Retry policy set" });
    } catch (err: unknown) {
      res.status(400).json({ error: (err as Error).message });
    }
  };
}

export function createRemoveRetryHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const removed = removeRetryPolicy(method, decodeURIComponent(path));
    if (!removed) {
      res.status(404).json({ error: "No retry policy found for this route" });
      return;
    }
    res.json({ message: "Retry policy removed" });
  };
}

export function registerRetryRoutes(router: Router): void {
  router.get("/__routewatch/retry", createRetryListHandler());
  router.get("/__routewatch/retry/:method/:path(*)", createGetRetryHandler());
  router.post("/__routewatch/retry/:method/:path(*)", createSetRetryHandler());
  router.delete("/__routewatch/retry/:method/:path(*)", createRemoveRetryHandler());
}
