/**
 * routePlayground.ts
 * Stores and manages interactive playground configurations per route.
 * Allows saving example request payloads and headers for try-it-out UI.
 */

export interface PlaygroundConfig {
  exampleBody?: Record<string, unknown>;
  exampleHeaders?: Record<string, string>;
  exampleQuery?: Record<string, string>;
  description?: string;
}

const store = new Map<string, PlaygroundConfig>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setPlayground(
  method: string,
  path: string,
  config: PlaygroundConfig
): void {
  store.set(makeKey(method, path), config);
}

export function getPlayground(
  method: string,
  path: string
): PlaygroundConfig | undefined {
  return store.get(makeKey(method, path));
}

export function removePlayground(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function getAllPlaygrounds(): Array<{
  method: string;
  path: string;
  config: PlaygroundConfig;
}> {
  return Array.from(store.entries()).map((entry) => {
    const [key, config] = entry;
    const [method, ...pathParts] = key.split(":");
    return { method, path: pathParts.join(":"), config };
  });
}

export function clearPlaygrounds(): void {
  store.clear();
}
