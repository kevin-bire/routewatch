# Route Throttle

The `routeThrottle` module provides per-route request throttling with sliding-window rate control.

## Overview

Unlike the `routeRateLimiter` module which tracks limits as static configuration, `routeThrottle` actively tracks request timestamps and enforces sliding-window throttling at the core level.

## API

### `setThrottle(method, path, policy)`
Registers a throttle policy for a specific route.

```ts
setThrottle('GET', '/api/users', { requestsPerWindow: 100, windowMs: 60000 });
```

### `getThrottle(method, path)`
Retrieves the throttle policy for a route, or `undefined` if none exists.

### `removeThrottle(method, path)`
Removes the throttle policy for a route. Returns `true` if removed.

### `getAllThrottles()`
Returns all registered throttle policies as a `Record<string, ThrottlePolicy>`.

### `checkThrottle(method, path)`
Checks whether the current request is within the throttle window.
- Returns `{ allowed: true }` if the request can proceed.
- Returns `{ allowed: false, retryAfterMs: number }` if the limit is exceeded.

### `clearThrottles()`
Clears all throttle policies and hit history (useful in tests).

## ThrottlePolicy

```ts
interface ThrottlePolicy {
  requestsPerWindow: number; // max requests allowed per window
  windowMs: number;          // window size in milliseconds
  burstLimit?: number;       // optional short-term burst cap
}
```

## Middleware

Use `throttleMiddleware` from `throttleHandler.ts` to enforce throttling on all routes:

```ts
app.use(throttleMiddleware);
```

Management endpoints are exposed under `/__routewatch/throttles`.
