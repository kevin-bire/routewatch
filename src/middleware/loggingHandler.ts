import { Router, Request, Response, NextFunction } from 'express';
import {
  setLogPolicy,
  getLogPolicy,
  removeLogPolicy,
  getAllLogPolicies,
  clearLogPolicies,
  LogPolicy,
} from '../core/routeLogging';

export function loggingPolicyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const policy = getLogPolicy(req.method, req.path);
  if (!policy || policy.level === 'silent') {
    return next();
  }
  const entry: Record<string, unknown> = {
    method: req.method,
    path: req.path,
    level: policy.level,
    timestamp: new Date().toISOString(),
  };
  if (policy.includeQuery) entry.query = req.query;
  if (policy.includeHeaders) entry.headers = req.headers;
  if (policy.includeBody) entry.body = req.body;
  if (policy.customFields) entry.custom = policy.customFields;
  console[policy.level === 'debug' ? 'debug' : policy.level === 'warn' ? 'warn' : policy.level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
  next();
}

export function createLogPolicyListHandler() {
  return (_req: Request, res: Response): void => {
    res.json(getAllLogPolicies());
  };
}

export function createSetLogPolicyHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const policy = req.body as LogPolicy;
    if (!policy || !policy.level) {
      res.status(400).json({ error: 'Missing required field: level' });
      return;
    }
    setLogPolicy(method, `/${path}`, policy);
    res.status(201).json({ method, path: `/${path}`, policy });
  };
}

export function createRemoveLogPolicyHandler() {
  return (req: Request, res: Response): void => {
    const { method, path } = req.params;
    const removed = removeLogPolicy(method, `/${path}`);
    if (!removed) {
      res.status(404).json({ error: 'Log policy not found' });
      return;
    }
    res.status(204).send();
  };
}

export function createClearLogPoliciesHandler() {
  return (_req: Request, res: Response): void => {
    clearLogPolicies();
    res.status(204).send();
  };
}

export function registerLoggingRoutes(router: Router): void {
  router.get('/routewatch/logging', createLogPolicyListHandler());
  router.post('/routewatch/logging/:method/*path', createSetLogPolicyHandler());
  router.delete('/routewatch/logging/:method/*path', createRemoveLogPolicyHandler());
  router.delete('/routewatch/logging', createClearLogPoliciesHandler());
}
