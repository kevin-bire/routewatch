# Route Changelog

The **routeChangelog** module tracks changes to registered API routes over time, enabling audit trails and live diff visibility in the RouteWatch dashboard.

## Concepts

### Snapshot
A snapshot captures the current state of all registered routes. Diffs are computed relative to the last snapshot.

### Diff
When routes are compared, each entry is classified as:
- `added` — route exists in current but not in previous snapshot
- `removed` — route existed in previous snapshot but is no longer registered
- `modified` — route exists in both but its definition has changed

### Changelog
All detected changes accumulate in an in-memory changelog. This is useful for surfacing recent API changes in documentation UIs.

## API

```ts
takeSnapshot(routes: RouteDefinition[]): void
```
Stores the current routes as the baseline for future diffs.

```ts
diffRoutes(previous, current): ChangelogEntry[]
```
Computes the diff between two route arrays without side effects.

```ts
recordChanges(current): ChangelogEntry[]
```
Diffs against the current snapshot, appends results to the changelog, and updates the snapshot.

```ts
getChangelog(): ChangelogEntry[]
```
Returns all accumulated changelog entries.

```ts
clearChangelog(): void
```
Resets the changelog and snapshot (useful in tests).

## HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/_routewatch/changelog` | Returns all recorded route changes |
| POST | `/_routewatch/changelog/snapshot` | Takes a new snapshot and returns detected changes |

## Example Response

```json
{
  "total": 1,
  "entries": [
    {
      "timestamp": "2024-01-15T12:00:00.000Z",
      "changeType": "added",
      "method": "GET",
      "path": "/users",
      "summary": "List users"
    }
  ]
}
```
