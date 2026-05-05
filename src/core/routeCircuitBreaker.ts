export interface CircuitBreakerConfig {
  threshold: number;   // failure count before opening
  resetTimeout: number; // ms before attempting half-open
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerEntry {
  config: CircuitBreakerConfig;
  state: CircuitState;
  failures: number;
  lastFailureAt: number | null;
  openedAt: number | null;
}

const store = new Map<string, CircuitBreakerEntry>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setCircuitBreaker(method: string, path: string, config: CircuitBreakerConfig): void {
  const key = makeKey(method, path);
  const existing = store.get(key);
  store.set(key, {
    config,
    state: existing?.state ?? 'closed',
    failures: existing?.failures ?? 0,
    lastFailureAt: existing?.lastFailureAt ?? null,
    openedAt: existing?.openedAt ?? null,
  });
}

export function getCircuitBreaker(method: string, path: string): CircuitBreakerEntry | undefined {
  return store.get(makeKey(method, path));
}

export function recordFailure(method: string, path: string): CircuitState {
  const key = makeKey(method, path);
  const entry = store.get(key);
  if (!entry) return 'closed';

  entry.failures += 1;
  entry.lastFailureAt = Date.now();

  if (entry.failures >= entry.config.threshold) {
    entry.state = 'open';
    entry.openedAt = Date.now();
  }

  return entry.state;
}

export function recordSuccess(method: string, path: string): void {
  const key = makeKey(method, path);
  const entry = store.get(key);
  if (!entry) return;
  entry.failures = 0;
  entry.state = 'closed';
  entry.openedAt = null;
}

export function getCircuitState(method: string, path: string): CircuitState {
  const key = makeKey(method, path);
  const entry = store.get(key);
  if (!entry) return 'closed';

  if (entry.state === 'open' && entry.openedAt !== null) {
    const elapsed = Date.now() - entry.openedAt;
    if (elapsed >= entry.config.resetTimeout) {
      entry.state = 'half-open';
    }
  }

  return entry.state;
}

export function getAllCircuitBreakers(): Record<string, CircuitBreakerEntry> {
  return Object.fromEntries(store.entries());
}

export function removeCircuitBreaker(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function clearCircuitBreakers(): void {
  store.clear();
}
