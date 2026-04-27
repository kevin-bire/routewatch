/**
 * routeMocking.ts
 * Allows routes to be flagged with mock response data for development/testing.
 */

export interface MockConfig {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
  delay?: number; // ms
}

const mockStore = new Map<string, MockConfig>();

function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setMock(method: string, path: string, config: MockConfig): void {
  mockStore.set(makeKey(method, path), config);
}

export function getMock(method: string, path: string): MockConfig | undefined {
  return mockStore.get(makeKey(method, path));
}

export function removeMock(method: string, path: string): boolean {
  return mockStore.delete(makeKey(method, path));
}

export function getAllMocks(): Array<{ method: string; path: string; config: MockConfig }> {
  return Array.from(mockStore.entries()).map((entry) => {
    const [key, config] = entry;
    const colonIdx = key.indexOf(':');
    return {
      method: key.slice(0, colonIdx),
      path: key.slice(colonIdx + 1),
      config,
    };
  });
}

export function hasMock(method: string, path: string): boolean {
  return mockStore.has(makeKey(method, path));
}

export function clearMocks(): void {
  mockStore.clear();
}
