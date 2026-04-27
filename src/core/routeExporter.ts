import { RouteDefinition } from './routeCollector';
import { generateSpec } from './specGenerator';

export type ExportFormat = 'json' | 'yaml';

export interface ExportOptions {
  format?: ExportFormat;
  pretty?: boolean;
}

function toYAML(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return `${pad}null`;
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    return obj.includes('\n') ? `|\n${obj.split('\n').map(l => pad + '  ' + l).join('\n')}` : obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => `\n${pad}- ${toYAML(item, indent + 1)}`).join('');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const valStr = typeof v === 'object' && v !== null && !Array.isArray(v)
          ? `\n${toYAML(v, indent + 1)}`
          : ` ${toYAML(v, indent + 1)}`;
        return `\n${pad}${k}:${valStr}`;
      })
      .join('');
  }
  return String(obj);
}

export function exportSpec(routes: RouteDefinition[], options: ExportOptions = {}): string {
  const { format = 'json', pretty = true } = options;
  const spec = generateSpec(routes);

  if (format === 'yaml') {
    const yaml = `openapi: '3.0.0'${toYAML(spec, 0)}`;
    return yaml;
  }

  return pretty ? JSON.stringify(spec, null, 2) : JSON.stringify(spec);
}

export function exportSpecToFile(
  routes: RouteDefinition[],
  options: ExportOptions = {}
): { content: string; mimeType: string; filename: string } {
  const format = options.format ?? 'json';
  const content = exportSpec(routes, options);
  const mimeType = format === 'yaml' ? 'application/x-yaml' : 'application/json';
  const filename = `openapi.${format}`;
  return { content, mimeType, filename };
}
