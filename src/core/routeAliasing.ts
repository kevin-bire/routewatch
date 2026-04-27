/**
 * routeAliasing.ts
 * Allows routes to be registered under one or more alias paths,
 * so the same route definition can be surfaced under multiple names.
 */

export interface RouteAlias {
  originalPath: string;
  method: string;
  aliases: string[];
  createdAt: string;
}

const aliasMap = new Map<string, RouteAlias>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function addAlias(
  method: string,
  originalPath: string,
  aliasPaths: string[]
): void {
  const key = makeKey(method, originalPath);
  const existing = aliasMap.get(key);
  if (existing) {
    const merged = Array.from(new Set([...existing.aliases, ...aliasPaths]));
    aliasMap.set(key, { ...existing, aliases: merged });
  } else {
    aliasMap.set(key, {
      originalPath,
      method: method.toUpperCase(),
      aliases: [...new Set(aliasPaths)],
      createdAt: new Date().toISOString(),
    });
  }
}

export function getAliases(method: string, originalPath: string): string[] {
  return aliasMap.get(makeKey(method, originalPath))?.aliases ?? [];
}

export function resolveOriginal(
  method: string,
  aliasPath: string
): string | null {
  for (const entry of aliasMap.values()) {
    if (
      entry.method === method.toUpperCase() &&
      entry.aliases.includes(aliasPath)
    ) {
      return entry.originalPath;
    }
  }
  return null;
}

export function getAllAliases(): RouteAlias[] {
  return Array.from(aliasMap.values());
}

export function removeAlias(method: string, originalPath: string): boolean {
  return aliasMap.delete(makeKey(method, originalPath));
}

export function clearAliases(): void {
  aliasMap.clear();
}
