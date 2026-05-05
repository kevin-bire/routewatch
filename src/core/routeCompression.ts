/**
 * routeCompression.ts
 * Manages per-route compression policies (gzip, br, deflate, identity).
 */

export type CompressionEncoding = 'gzip' | 'br' | 'deflate' | 'identity';

export interface CompressionPolicy {
  enabled: boolean;
  encodings: CompressionEncoding[];
  threshold?: number; // minimum response size in bytes before compressing
}

const store = new Map<string, CompressionPolicy>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setCompression(method: string, path: string, policy: CompressionPolicy): void {
  store.set(makeKey(method, path), policy);
}

export function getCompression(method: string, path: string): CompressionPolicy | undefined {
  return store.get(makeKey(method, path));
}

export function removeCompression(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function getAllCompressionPolicies(): Array<{ method: string; path: string; policy: CompressionPolicy }> {
  return Array.from(store.entries()).map((entry) => {
    const [key, policy] = entry;
    const [method, ...pathParts] = key.split(':');
    return { method, path: pathParts.join(':'), policy };
  });
}

export function clearCompressionPolicies(): void {
  store.clear();
}

export function isCompressionEnabled(method: string, path: string): boolean {
  const policy = getCompression(method, path);
  return policy?.enabled ?? false;
}

export function getEffectiveEncodings(method: string, path: string): CompressionEncoding[] {
  const policy = getCompression(method, path);
  if (!policy || !policy.enabled) return ['identity'];
  return policy.encodings.length > 0 ? policy.encodings : ['gzip'];
}
