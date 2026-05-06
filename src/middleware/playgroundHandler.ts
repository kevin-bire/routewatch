/**
 * playgroundHandler.ts
 * Express route handlers for managing route playground configurations.
 */

import { Router, Request, Response } from "express";
import {
  setPlayground,
  getPlayground,
  removePlayground,
  getAllPlaygrounds,
  PlaygroundConfig,
} from "../core/routePlayground";

export function createPlaygroundListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllPlaygrounds());
  };
}

export function createGetPlaygroundHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const decodedPath = decodeURIComponent(path);
    const config = getPlayground(method, decodedPath);
    if (!config) {
      res.status(404).json({ error: "Playground config not found" });
      return;
    }
    res.json(config);
  };
}

export function createSetPlaygroundHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const decodedPath = decodeURIComponent(path);
    const config: PlaygroundConfig = req.body;
    if (!config || typeof config !== "object") {
      res.status(400).json({ error: "Invalid playground config" });
      return;
    }
    setPlayground(method, decodedPath, config);
    res.status(201).json({ message: "Playground config saved", method, path: decodedPath });
  };
}

export function createRemovePlaygroundHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const decodedPath = decodeURIComponent(path);
    const removed = removePlayground(method, decodedPath);
    if (!removed) {
      res.status(404).json({ error: "Playground config not found" });
      return;
    }
    res.json({ message: "Playground config removed" });
  };
}

export function registerPlaygroundRoutes(router: Router): void {
  router.get("/playground", createPlaygroundListHandler());
  router.get("/playground/:method/:path(*)", createGetPlaygroundHandler());
  router.post("/playground/:method/:path(*)", createSetPlaygroundHandler());
  router.delete("/playground/:method/:path(*)", createRemovePlaygroundHandler());
}
