# Route Annotation

The `routeAnnotation` module lets you attach arbitrary key-value metadata to any registered route. Annotations are intended for documentation, governance, and tooling purposes and are **not** enforced at runtime.

## API

### `setAnnotations(method, path, annotations)`
Merges the supplied key-value pairs into the annotation store for the given route. Repeated calls are additive.

```ts
setAnnotations("GET", "/users", { owner: "team-a", public: true });
```

### `getAnnotations(method, path)`
Returns the annotations for the route, or `undefined` if none exist.

### `removeAnnotation(method, path, key)`
Removes a single annotation key. Returns `true` on success, `false` if the key or route was not found.

### `removeAnnotations(method, path)`
Removes **all** annotations for a route. Returns `true` on success.

### `getAllAnnotations()`
Returns a snapshot of every stored annotation keyed by `"METHOD:path"`.

### `clearAnnotations()`
Clears the entire store (useful in tests).

## REST Endpoints

When `registerAnnotationRoutes(router)` is called the following endpoints are available under the configured prefix (default `/_routewatch`):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/annotations` | List all annotations |
| `GET` | `/annotations/:method/:path` | Get annotations for a route |
| `POST` | `/annotations/:method/:path` | Set/merge annotations (JSON body) |
| `DELETE` | `/annotations/:method/:path/:key` | Remove a single annotation key |
| `DELETE` | `/annotations/:method/:path` | Remove all annotations for a route |

## Example

```ts
import express from "express";
import { registerAnnotationRoutes } from "routewatch/middleware/annotationHandler";

const app = express();
const router = express.Router();
registerAnnotationRoutes(router);
app.use("/_routewatch", router);
```
