import { exportSpec, exportSpecToFile } from './routeExporter';
import { RouteDefinition } from './routeCollector';

const sampleRoutes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/users',
    summary: 'List users',
    tags: ['users'],
    responses: { 200: { description: 'OK' } },
  },
  {
    method: 'POST',
    path: '/users',
    summary: 'Create user',
    tags: ['users'],
    responses: { 201: { description: 'Created' } },
  },
];

describe('exportSpec', () => {
  it('exports spec as pretty JSON by default', () => {
    const result = exportSpec(sampleRoutes);
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('openapi');
    expect(parsed).toHaveProperty('paths');
    expect(result).toContain('\n');
  });

  it('exports spec as minified JSON when pretty is false', () => {
    const result = exportSpec(sampleRoutes, { format: 'json', pretty: false });
    expect(() => JSON.parse(result)).not.toThrow();
    expect(result).not.toContain('\n');
  });

  it('exports spec as YAML format', () => {
    const result = exportSpec(sampleRoutes, { format: 'yaml' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('openapi');
  });

  it('includes route paths in JSON output', () => {
    const result = exportSpec(sampleRoutes, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.paths).toHaveProperty('/users');
  });
});

describe('exportSpecToFile', () => {
  it('returns correct metadata for JSON format', () => {
    const result = exportSpecToFile(sampleRoutes, { format: 'json' });
    expect(result.filename).toBe('openapi.json');
    expect(result.mimeType).toBe('application/json');
    expect(() => JSON.parse(result.content)).not.toThrow();
  });

  it('returns correct metadata for YAML format', () => {
    const result = exportSpecToFile(sampleRoutes, { format: 'yaml' });
    expect(result.filename).toBe('openapi.yaml');
    expect(result.mimeType).toBe('application/x-yaml');
    expect(result.content).toBeTruthy();
  });

  it('defaults to JSON format when no format specified', () => {
    const result = exportSpecToFile(sampleRoutes);
    expect(result.filename).toBe('openapi.json');
    expect(result.mimeType).toBe('application/json');
  });
});
