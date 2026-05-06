export interface TraceEntry {
  traceId: string;
  method: string;
  path: string;
  startedAt: number;
  duration?: number;
  statusCode?: number;
  error?: string;
}

const traces = new Map<string, TraceEntry[]>();
const MAX_TRACES_PER_ROUTE = 100;

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function recordTrace(entry: TraceEntry): void {
  const key = makeKey(entry.method, entry.path);
  if (!traces.has(key)) traces.set(key, []);
  const list = traces.get(key)!;
  list.unshift(entry);
  if (list.length > MAX_TRACES_PER_ROUTE) list.pop();
}

export function getTraces(method: string, path: string): TraceEntry[] {
  return traces.get(makeKey(method, path)) ?? [];
}

export function getAllTraces(): Record<string, TraceEntry[]> {
  const result: Record<string, TraceEntry[]> = {};
  for (const [key, entries] of traces.entries()) {
    result[key] = entries;
  }
  return result;
}

export function clearTraces(method?: string, path?: string): void {
  if (method && path) {
    traces.delete(makeKey(method, path));
  } else {
    traces.clear();
  }
}

export function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
