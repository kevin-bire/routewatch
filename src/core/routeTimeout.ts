const timeouts = new Map<string, number>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setRouteTimeout(method: string, path: string, ms: number): void {
  if (ms <= 0) throw new Error("Timeout must be a positive number");
  timeouts.set(makeKey(method, path), ms);
}

export function getRouteTimeout(method: string, path: string): number | undefined {
  return timeouts.get(makeKey(method, path));
}

export function removeRouteTimeout(method: string, path: string): boolean {
  return timeouts.delete(makeKey(method, path));
}

export function getAllTimeouts(): Array<{ method: string; path: string; ms: number }> {
  return Array.from(timeouts.entries()).map((entry) => {
    const [key, ms] = entry;
    const colonIdx = key.indexOf(":");
    return {
      method: key.slice(0, colonIdx),
      path: key.slice(colonIdx + 1),
      ms,
    };
  });
}

export function clearTimeouts(): void {
  timeouts.clear();
}

export function hasTimeout(method: string, path: string): boolean {
  return timeouts.has(makeKey(method, path));
}
