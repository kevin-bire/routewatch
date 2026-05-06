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

/**
 * Registers a mock response for a given HTTP method and path.
 * Overwrites any existing mock for the same method/path combination.
 */
export function setMock(method: string, path: string, config: MockConfig): void {
  if (!method || !path) {
    throw new Error('method and path must be non-empty strings');
  }
  mockStore.set(makeKey(method, path), config);
}

/**
 * Retrieves the mock config for a given HTTP method and path, or undefined if none exists.
 */
export function getMock(method: string, path: string): MockConfig | undefined {
  return mockStore.get(makeKey(method, path));
}

/**
 * Removes the mock for a given HTTP method and path.
 * Returns true if a mock existed and was removed, false otherwise.
 */
export function removeMock(method: string, path: string): boolean {
  return mockStore.delete(makeKey(method, path));
}

/**
 * Returns all registered mocks as an array of { method, path, config } objects.
 */
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

/**
 * Returns true if a mock is registered for the given HTTP method and path.
 */
export function hasMock(method: string, path: string): boolean {
  return mockStore.has(makeKey(method, path));
}

/**
 * Removes all registered mocks.
 */
export function clearMocks(): void {
  mockStore.clear();
}

/**
 * Returns the total number of currently registered mocks.
 */
export function getMockCount(): number {
  return mockStore.size;
}
