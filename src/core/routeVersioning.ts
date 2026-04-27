export interface VersionedRoute {
  version: string;
  deprecated?: boolean;
  deprecatedSince?: string;
  replacedBy?: string;
}

export function extractVersion(path: string): string | null {
  const match = path.match(/^\/v(\d+(?:\.\d+)?)\//);
  return match ? match[1] : null;
}

export function groupRoutesByVersion<T extends { path: string }>(routes: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const route of routes) {
    const version = extractVersion(route.path) ?? 'unversioned';
    if (!grouped.has(version)) {
      grouped.set(version, []);
    }
    grouped.get(version)!.push(route);
  }

  return grouped;
}

export function getLatestVersion(versions: string[]): string | null {
  const numeric = versions
    .filter((v) => v !== 'unversioned')
    .map((v) => ({ raw: v, num: parseFloat(v) }))
    .sort((a, b) => b.num - a.num);

  return numeric.length > 0 ? numeric[0].raw : null;
}

export function markDeprecatedRoutes<T extends { path: string; deprecated?: boolean }>(
  routes: T[],
  latestVersion: string
): T[] {
  return routes.map((route) => {
    const version = extractVersion(route.path);
    if (version !== null && parseFloat(version) < parseFloat(latestVersion)) {
      return { ...route, deprecated: true, deprecatedSince: `v${latestVersion}` };
    }
    return route;
  });
}
