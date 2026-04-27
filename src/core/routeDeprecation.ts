export interface DeprecationEntry {
  path: string;
  method: string;
  deprecatedAt: string;
  sunset?: string;
  replacement?: string;
  reason?: string;
}

const deprecations: Map<string, DeprecationEntry> = new Map();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function markDeprecated(
  method: string,
  path: string,
  options: { sunset?: string; replacement?: string; reason?: string } = {}
): DeprecationEntry {
  const entry: DeprecationEntry = {
    path,
    method: method.toUpperCase(),
    deprecatedAt: new Date().toISOString(),
    ...options,
  };
  deprecations.set(makeKey(method, path), entry);
  return entry;
}

export function isDeprecated(method: string, path: string): boolean {
  return deprecations.has(makeKey(method, path));
}

export function getDeprecation(method: string, path: string): DeprecationEntry | undefined {
  return deprecations.get(makeKey(method, path));
}

export function getAllDeprecations(): DeprecationEntry[] {
  return Array.from(deprecations.values());
}

export function removeDeprecation(method: string, path: string): boolean {
  return deprecations.delete(makeKey(method, path));
}

export function clearDeprecations(): void {
  deprecations.clear();
}
