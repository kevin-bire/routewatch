export interface ThrottlePolicy {
  requestsPerWindow: number;
  windowMs: number;
  burstLimit?: number;
}

interface ThrottleEntry {
  policy: ThrottlePolicy;
  hits: number[];
}

const throttleStore = new Map<string, ThrottleEntry>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setThrottle(method: string, path: string, policy: ThrottlePolicy): void {
  const key = makeKey(method, path);
  throttleStore.set(key, { policy, hits: [] });
}

export function getThrottle(method: string, path: string): ThrottlePolicy | undefined {
  return throttleStore.get(makeKey(method, path))?.policy;
}

export function removeThrottle(method: string, path: string): boolean {
  return throttleStore.delete(makeKey(method, path));
}

export function getAllThrottles(): Record<string, ThrottlePolicy> {
  const result: Record<string, ThrottlePolicy> = {};
  for (const [key, entry] of throttleStore.entries()) {
    result[key] = entry.policy;
  }
  return result;
}

export function checkThrottle(method: string, path: string): { allowed: boolean; retryAfterMs?: number } {
  const key = makeKey(method, path);
  const entry = throttleStore.get(key);
  if (!entry) return { allowed: true };

  const now = Date.now();
  const { policy } = entry;
  entry.hits = entry.hits.filter(t => now - t < policy.windowMs);

  const limit = policy.burstLimit ?? policy.requestsPerWindow;
  if (entry.hits.length >= limit) {
    const oldest = entry.hits[0];
    const retryAfterMs = policy.windowMs - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  entry.hits.push(now);
  return { allowed: true };
}

export function clearThrottles(): void {
  throttleStore.clear();
}
