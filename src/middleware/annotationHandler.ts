import { Router, Request, Response } from "express";
import {
  setAnnotations,
  getAnnotations,
  removeAnnotation,
  removeAnnotations,
  getAllAnnotations,
} from "../core/routeAnnotation";

export function createAnnotationListHandler() {
  return (_req: Request, res: Response) => {
    res.json(getAllAnnotations());
  };
}

export function createGetAnnotationHandler() {
  return (req: Request, res: Response) => {
    const { method, path } = req.params;
    const annotations = getAnnotations(method, decodeURIComponent(path));
    if (!annotations) {
      return res.status(404).json({ error: "No annotations found for route" });
    }
    res.json(annotations);
  };
}

export function createSetAnnotationHandler() {
  return (req: Request, res: Response) => {
    const { method, path } = req.params;
    const annotations = req.body;
    if (!annotations || typeof annotations !== "object" || Array.isArray(annotations)) {
      return res.status(400).json({ error: "Body must be a key-value object" });
    }
    setAnnotations(method, decodeURIComponent(path), annotations);
    res.status(200).json({ success: true });
  };
}

export function createRemoveAnnotationKeyHandler() {
  return (req: Request, res: Response) => {
    const { method, path, key } = req.params;
    const removed = removeAnnotation(method, decodeURIComponent(path), key);
    if (!removed) {
      return res.status(404).json({ error: "Annotation key not found" });
    }
    res.json({ success: true });
  };
}

export function createRemoveAnnotationsHandler() {
  return (req: Request, res: Response) => {
    const { method, path } = req.params;
    const removed = removeAnnotations(method, decodeURIComponent(path));
    if (!removed) {
      return res.status(404).json({ error: "No annotations found for route" });
    }
    res.json({ success: true });
  };
}

export function registerAnnotationRoutes(router: Router): void {
  router.get("/annotations", createAnnotationListHandler());
  router.get("/annotations/:method/:path", createGetAnnotationHandler());
  router.post("/annotations/:method/:path", createSetAnnotationHandler());
  router.delete("/annotations/:method/:path/:key", createRemoveAnnotationKeyHandler());
  router.delete("/annotations/:method/:path", createRemoveAnnotationsHandler());
}
