import { Router, Request, Response, NextFunction } from "express";
import {
  setRouteTimeout,
  getRouteTimeout,
  removeRouteTimeout,
  getAllTimeouts,
  clearTimeouts,
} from "../core/routeTimeout";

export function createTimeoutListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllTimeouts());
  };
}

export function createGetTimeoutHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.query as { method: string; path: string };
    if (!method || !path) {
      res.status(400).json({ error: "method and path query params required" });
      return;
    }
    const ms = getRouteTimeout(method, path);
    if (ms === undefined) {
      res.status(404).json({ error: "No timeout configured for this route" });
      return;
    }
    res.json({ method, path, ms });
  };
}

export function createSetTimeoutHandler() {
  return (req: Request, res: Response): void => {
    const { method, path, ms } = req.body as { method: string; path: string; ms: number };
    if (!method || !path || ms === undefined) {
      res.status(400).json({ error: "method, path, and ms are required" });
      return;
    }
    try {
      setRouteTimeout(method, path, ms);
      res.status(201).json({ method, path, ms });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}

export function createRemoveTimeoutHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.body as { method: string; path: string };
    if (!method || !path) {
      res.status(400).json({ error: "method and path are required" });
      return;
    }
    const removed = removeRouteTimeout(method, path);
    if (!removed) {
      res.status(404).json({ error: "Timeout not found" });
      return;
    }
    res.json({ success: true });
  };
}

export function createClearTimeoutsHandler() {
  return (_req: Request, res: Response): void => {
    clearTimeouts();
    res.json({ success: true });
  };
}

export function registerTimeoutRoutes(router: Router): void {
  router.get("/_routewatch/timeouts", createTimeoutListHandler());
  router.get("/_routewatch/timeouts/get", createGetTimeoutHandler());
  router.post("/_routewatch/timeouts", createSetTimeoutHandler());
  router.delete("/_routewatch/timeouts", createRemoveTimeoutHandler());
  router.delete("/_routewatch/timeouts/all", createClearTimeoutsHandler());
}
