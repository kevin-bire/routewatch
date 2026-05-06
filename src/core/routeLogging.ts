export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogPolicy {
  level: LogLevel;
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeQuery?: boolean;
  customFields?: Record<string, string>;
}

const policies = new Map<string, LogPolicy>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setLogPolicy(method: string, path: string, policy: LogPolicy): void {
  policies.set(makeKey(method, path), policy);
}

export function getLogPolicy(method: string, path: string): LogPolicy | undefined {
  return policies.get(makeKey(method, path));
}

export function removeLogPolicy(method: string, path: string): boolean {
  return policies.delete(makeKey(method, path));
}

export function getAllLogPolicies(): Array<{ method: string; path: string; policy: LogPolicy }> {
  return Array.from(policies.entries()).map((entry) => {
    const [key, policy] = entry;
    const colonIdx = key.indexOf(':');
    return {
      method: key.substring(0, colonIdx),
      path: key.substring(colonIdx + 1),
      policy,
    };
  });
}

export function clearLogPolicies(): void {
  policies.clear();
}
