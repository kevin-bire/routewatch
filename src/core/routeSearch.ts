import { RouteDefinition } from './routeCollector';

export interface SearchOptions {
  query: string;
  fields?: Array<'path' | 'method' | 'tags' | 'summary' | 'description'>;
  caseSensitive?: boolean;
}

export interface SearchResult {
  route: RouteDefinition;
  matchedFields: string[];
  score: number;
}

const DEFAULT_FIELDS: SearchOptions['fields'] = ['path', 'method', 'tags', 'summary', 'description'];

function scoreMatch(value: string, query: string, caseSensitive: boolean): number {
  const haystack = caseSensitive ? value : value.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  if (haystack === needle) return 2;
  if (haystack.includes(needle)) return 1;
  return 0;
}

export function searchRoutes(
  routes: RouteDefinition[],
  options: SearchOptions
): SearchResult[] {
  const { query, fields = DEFAULT_FIELDS, caseSensitive = false } = options;

  if (!query || query.trim() === '') return routes.map(route => ({ route, matchedFields: [], score: 0 }));

  const results: SearchResult[] = [];

  for (const route of routes) {
    const matchedFields: string[] = [];
    let totalScore = 0;

    for (const field of fields) {
      const rawValue = field === 'tags'
        ? (route.tags ?? []).join(' ')
        : String((route as Record<string, unknown>)[field] ?? '');

      const score = scoreMatch(rawValue, query.trim(), caseSensitive);
      if (score > 0) {
        matchedFields.push(field);
        totalScore += score;
      }
    }

    if (matchedFields.length > 0) {
      results.push({ route, matchedFields, score: totalScore });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function extractSearchQuery(rawQuery: unknown): string {
  if (typeof rawQuery === 'string') return rawQuery.trim();
  return '';
}
