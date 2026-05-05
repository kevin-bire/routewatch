# routeCache

Per-route response caching configuration for RouteWatch.

## Overview

`routeCache` lets you attach a `CachePolicy` to any route (identified by HTTP method + path). The companion middleware `cacheHeadersMiddleware` reads these policies at request time and injects the appropriate `Cache-Control` (and optionally `Vary`) headers into the response.

## CachePolicy shape

```ts
interface CachePolicy {
  ttl: number;        // Max-Age in seconds
  varyBy?: string[];  // Headers/query params that differentiate cached responses
  noStore?: boolean;  // Emit Cache-Control: no-store
  tags?: string[];    // Logical grouping tags (informational)
}
```

## Core API

| Function | Description |
|---|---|
| `setCache(method, path, policy)` | Attach a cache policy to a route |
| `getCache(method, path)` | Retrieve the policy for a route |
| `removeCache(method, path)` | Remove the policy for a route |
| `getAllCachePolicies()` | Return all stored policies as a plain object |
| `isCacheEnabled(method, path)` | `true` if a non-noStore policy exists |
| `getCacheHeaders(method, path)` | Get the headers object to inject |
| `clearAllCachePolicies()` | Reset the store (useful in tests) |

## REST endpoints (via `registerCacheRoutes`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/__routewatch/cache` | List all policies |
| `GET` | `/__routewatch/cache/:method/*path` | Get policy for a route |
| `POST` | `/__routewatch/cache/:method/*path` | Set policy (body: `CachePolicy`) |
| `DELETE` | `/__routewatch/cache/:method/*path` | Remove policy |

## Middleware

```ts
import { cacheHeadersMiddleware } from './middleware/cacheHandler';
app.use(cacheHeadersMiddleware);
```

Place this **before** your route handlers so headers are applied on every matching request.
