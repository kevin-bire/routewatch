# Route Tracing

The `routeTracing` module records per-request trace entries for each route, enabling lightweight observability directly within RouteWatch.

## Core API

### `recordTrace(entry: TraceEntry): void`
Stores a trace entry for the given method + path. At most 100 traces are kept per route (newest first).

### `getTraces(method, path): TraceEntry[]`
Returns all stored traces for a specific route.

### `getAllTraces(): Record<string, TraceEntry[]>`
Returns traces grouped by `METHOD:path` key.

### `clearTraces(method?, path?): void`
Clears traces for a specific route, or all traces if no arguments are given.

### `generateTraceId(): string`
Generates a unique trace identifier.

## Middleware

### `tracingMiddleware`
Express middleware that automatically records a trace on every response finish event. Attaches `traceId` to `req.traceId`.

## HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/routewatch/traces` | List all traces grouped by route |
| GET | `/routewatch/traces/route?method=&path=` | Get traces for a specific route |
| DELETE | `/routewatch/traces` | Clear traces (optionally scoped by `method` + `path` query params) |

## Example

```ts
import { tracingMiddleware, registerTracingRoutes } from 'routewatch';

app.use(tracingMiddleware);
registerTracingRoutes(app);
```
