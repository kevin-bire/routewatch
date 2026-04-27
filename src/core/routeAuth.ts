export type AuthScheme = 'none' | 'bearer' | 'apiKey' | 'basic' | 'oauth2';

export interface AuthConfig {
  scheme: AuthScheme;
  description?: string;
  scopes?: string[];
}

export interface RouteAuthEntry {
  method: string;
  path: string;
  auth: AuthConfig;
}

const authRegistry = new Map<string, AuthConfig>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteAuth(method: string, path: string, auth: AuthConfig): void {
  authRegistry.set(makeKey(method, path), auth);
}

export function getRouteAuth(method: string, path: string): AuthConfig | undefined {
  return authRegistry.get(makeKey(method, path));
}

export function removeRouteAuth(method: string, path: string): boolean {
  return authRegistry.delete(makeKey(method, path));
}

export function getAllRouteAuths(): RouteAuthEntry[] {
  return Array.from(authRegistry.entries()).map(([key, auth]) => {
    const [method, ...pathParts] = key.split(':');
    return { method, path: pathParts.join(':'), auth };
  });
}

export function hasAuth(method: string, path: string): boolean {
  return authRegistry.has(makeKey(method, path));
}

export function clearAuthRegistry(): void {
  authRegistry.clear();
}

export function applyDefaultAuth(scheme: AuthScheme, description?: string): void {
  const existing = getAllRouteAuths();
  existing.forEach(({ method, path, auth }) => {
    if (auth.scheme === 'none') {
      setRouteAuth(method, path, { scheme, description });
    }
  });
}
