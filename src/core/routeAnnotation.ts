/**
 * routeAnnotation.ts
 * Allows attaching arbitrary key-value annotations to routes for
 * documentation, tooling, and governance purposes.
 */

type Annotations = Record<string, string | number | boolean>;

const store = new Map<string, Annotations>();

export function makeKey(method: string, path: string): string {
  return `${method.toUpperCase()}:${path}`;
}

export function setAnnotations(
  method: string,
  path: string,
  annotations: Annotations
): void {
  const key = makeKey(method, path);
  const existing = store.get(key) ?? {};
  store.set(key, { ...existing, ...annotations });
}

export function getAnnotations(
  method: string,
  path: string
): Annotations | undefined {
  return store.get(makeKey(method, path));
}

export function removeAnnotation(
  method: string,
  path: string,
  annotationKey: string
): boolean {
  const key = makeKey(method, path);
  const existing = store.get(key);
  if (!existing || !(annotationKey in existing)) return false;
  delete existing[annotationKey];
  if (Object.keys(existing).length === 0) {
    store.delete(key);
  } else {
    store.set(key, existing);
  }
  return true;
}

export function removeAnnotations(method: string, path: string): boolean {
  return store.delete(makeKey(method, path));
}

export function getAllAnnotations(): Record<string, Annotations> {
  return Object.fromEntries(store.entries());
}

export function clearAnnotations(): void {
  store.clear();
}
