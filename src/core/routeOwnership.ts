/**
 * routeOwnership.ts
 * Track ownership (team/individual) for registered routes.
 */

export interface RouteOwner {
  team?: string;
  contact?: string;
  slack?: string;
  oncall?: string;
}

const ownershipMap = new Map<string, RouteOwner>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setOwnership(method: string, path: string, owner: RouteOwner): void {
  ownershipMap.set(makeKey(method, path), { ...owner });
}

export function getOwnership(method: string, path: string): RouteOwner | undefined {
  return ownershipMap.get(makeKey(method, path));
}

export function removeOwnership(method: string, path: string): boolean {
  return ownershipMap.delete(makeKey(method, path));
}

export function getAllOwnerships(): Record<string, RouteOwner> {
  const result: Record<string, RouteOwner> = {};
  for (const [key, owner] of ownershipMap.entries()) {
    result[key] = owner;
  }
  return result;
}

export function getRoutesByTeam(team: string): string[] {
  const routes: string[] = [];
  for (const [key, owner] of ownershipMap.entries()) {
    if (owner.team === team) {
      routes.push(key);
    }
  }
  return routes;
}

export function clearOwnerships(): void {
  ownershipMap.clear();
}
