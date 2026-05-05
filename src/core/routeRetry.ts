/**
 * routeRetry.ts
 * Stores and manages retry policies for registered routes.
 */

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  retryOn?: number[]; // HTTP status codes that trigger a retry
}

const retryStore = new Map<string, RetryPolicy>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRetryPolicy(method: string, path: string, policy: RetryPolicy): void {
  if (policy.maxAttempts < 1) {
    throw new Error("maxAttempts must be at least 1");
  }
  if (policy.backoffMs < 0) {
    throw new Error("backoffMs must be non-negative");
  }
  retryStore.set(makeKey(method, path), { ...policy });
}

export function getRetryPolicy(method: string, path: string): RetryPolicy | undefined {
  return retryStore.get(makeKey(method, path));
}

export function removeRetryPolicy(method: string, path: string): boolean {
  return retryStore.delete(makeKey(method, path));
}

export function getAllRetryPolicies(): Record<string, RetryPolicy> {
  const result: Record<string, RetryPolicy> = {};
  for (const [key, policy] of retryStore.entries()) {
    result[key] = { ...policy };
  }
  return result;
}

export function clearRetryPolicies(): void {
  retryStore.clear();
}

export function hasRetryPolicy(method: string, path: string): boolean {
  return retryStore.has(makeKey(method, path));
}
