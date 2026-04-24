# routewatch

Lightweight Express/Fastify middleware that auto-generates and serves live API documentation from route definitions.

## Installation

```bash
npm install routewatch
```

## Usage

### Express

```typescript
import express from "express";
import { routewatch } from "routewatch";

const app = express();

app.get("/users", (req, res) => res.json({ users: [] }));
app.post("/users", (req, res) => res.status(201).json({ created: true }));

// Mount the middleware — docs available at /api-docs
app.use(routewatch(app, { path: "/api-docs" }));

app.listen(3000, () => console.log("Server running on port 3000"));
```

### Fastify

```typescript
import Fastify from "fastify";
import { routewatchFastify } from "routewatch";

const fastify = Fastify();

fastify.register(routewatchFastify, { path: "/api-docs" });

fastify.get("/users", async () => ({ users: [] }));

fastify.listen({ port: 3000 });
```

### Options

| Option      | Type      | Default      | Description                          |
|-------------|-----------|--------------|--------------------------------------|
| `path`      | `string`  | `/api-docs`  | URL path where docs are served       |
| `title`     | `string`  | `"API Docs"` | Title displayed in the docs UI       |
| `liveReload`| `boolean` | `true`       | Auto-refresh docs on route changes   |

## License

[MIT](./LICENSE)