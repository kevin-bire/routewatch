import { Router, Request, Response } from 'express';
import {
  createSnapshot,
  getSnapshot,
  getAllSnapshots,
  deleteSnapshot,
  diffSnapshots,
} from '../core/routeSnapshot';
import { getRoutes } from '../core/routeCollector';

export function createSnapshotListHandler() {
  return (_req: Request, res: Response) => {
    res.json(getAllSnapshots());
  };
}

export function createTakeSnapshotHandler() {
  return (req: Request, res: Response) => {
    const label = typeof req.body?.label === 'string' ? req.body.label : undefined;
    const routes = getRoutes();
    const snapshot = createSnapshot(routes, label);
    res.status(201).json(snapshot);
  };
}

export function createGetSnapshotHandler() {
  return (req: Request, res: Response) => {
    const snapshot = getSnapshot(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    res.json(snapshot);
  };
}

export function createDeleteSnapshotHandler() {
  return (req: Request, res: Response) => {
    const deleted = deleteSnapshot(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    res.status(204).send();
  };
}

export function createDiffSnapshotHandler() {
  return (req: Request, res: Response) => {
    const { baseId, compareId } = req.params;
    const diff = diffSnapshots(baseId, compareId);
    if (!diff) {
      return res.status(404).json({ error: 'One or both snapshots not found' });
    }
    res.json(diff);
  };
}

export function registerSnapshotRoutes(router: Router, prefix = '/__routewatch/snapshots'): void {
  router.get(prefix, createSnapshotListHandler());
  router.post(prefix, createTakeSnapshotHandler());
  router.get(`${prefix}/:id`, createGetSnapshotHandler());
  router.delete(`${prefix}/:id`, createDeleteSnapshotHandler());
  router.get(`${prefix}/:baseId/diff/:compareId`, createDiffSnapshotHandler());
}
