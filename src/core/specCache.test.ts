import { clearCache, getCache, invalidateCache, isCacheDirty, setCache } from './specCache';
import { OpenAPISpec } from './schemaBuilder';

const mockSpec: OpenAPISpec = {
  openapi: '3.0.3',
  info: { title: 'Test', version: '0.0.1' },
  paths: {},
};

beforeEach(() => {
  clearCache();
});

describe('specCache', () => {
  it('is dirty initially', () => {
    expect(isCacheDirty()).toBe(true);
  });

  it('returns null when cache is dirty', () => {
    expect(getCache()).toBeNull();
  });

  it('stores spec and marks cache as clean', () => {
    setCache(mockSpec);
    expect(isCacheDirty()).toBe(false);
    expect(getCache()).toEqual(mockSpec);
  });

  it('invalidateCache marks cache as dirty', () => {
    setCache(mockSpec);
    invalidateCache();
    expect(isCacheDirty()).toBe(true);
    expect(getCache()).toBeNull();
  });

  it('clearCache resets everything', () => {
    setCache(mockSpec);
    clearCache();
    expect(isCacheDirty()).toBe(true);
    expect(getCache()).toBeNull();
  });
});
