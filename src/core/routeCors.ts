export interface CorsPolicy {
  origins: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
  maxAge?: number;
}

interface CorsEntry {
  policy: CorsPolicy;
  updatedAt: Date;
}

const corsMap = new Map<string, CorsEntry>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteCors(method: string, path: string, policy: CorsPolicy): void {
  corsMap.set(makeKey(method, path), { policy, updatedAt: new Date() });
}

export function getRouteCors(method: string, path: string): CorsPolicy | undefined {
  return corsMap.get(makeKey(method, path))?.policy;
}

export function removeRouteCors(method: string, path: string): boolean {
  return corsMap.delete(makeKey(method, path));
}

export function getAllCorsPolicies(): Record<string, CorsPolicy> {
  const result: Record<string, CorsPolicy> = {};
  for (const [key, entry] of corsMap.entries()) {
    result[key] = entry.policy;
  }
  return result;
}

export function clearCorsPolicies(): void {
  corsMap.clear();
}

export function isOriginAllowed(method: string, path: string, origin: string): boolean {
  const policy = getRouteCors(method, path);
  if (!policy) return false;
  return policy.origins.includes('*') || policy.origins.includes(origin);
}

export function applyCorsPolicyHeaders(
  method: string,
  path: string,
  origin: string
): Record<string, string> {
  const policy = getRouteCors(method, path);
  if (!policy) return {};
  const headers: Record<string, string> = {};
  if (isOriginAllowed(method, path, origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  if (policy.methods?.length) {
    headers['Access-Control-Allow-Methods'] = policy.methods.join(', ');
  }
  if (policy.headers?.length) {
    headers['Access-Control-Allow-Headers'] = policy.headers.join(', ');
  }
  if (policy.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  if (policy.maxAge !== undefined) {
    headers['Access-Control-Max-Age'] = String(policy.maxAge);
  }
  return headers;
}
