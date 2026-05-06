export interface RouteLogPolicy {
  enabled: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error';
  includeHeaders?: boolean;
  includeBody?: boolean;
  maskFields?: string[];
}

const store = new Map<string, RouteLogPolicy>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setLogPolicy(method: string, path: string, policy: RouteLogPolicy): void {
  store.set(makeKey(method, path), policy);
}

export function getLogPolicy(method: string, path: string): RouteLogPolicy | undefined {
  return store.get(makeKey(method, path));
}

export function removeLogPolicy(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function getAllLogPolicies(): Record<string, RouteLogPolicy> {
  const result: Record<string, RouteLogPolicy> = {};
  for (const [key, policy] of store.entries()) {
    result[key] = policy;
  }
  return result;
}

export function isLoggingEnabled(method: string, path: string): boolean {
  const policy = store.get(makeKey(method, path));
  return policy?.enabled ?? false;
}

export function clearLogPolicies(): void {
  store.clear();
}
