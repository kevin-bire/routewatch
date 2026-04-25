import { Request, Response, NextFunction, Router } from 'express';
import { generateSpec, generateSpecJSON } from '../core/specGenerator';
import { registerRoute } from '../core/routeCollector';
import { RouteDefinition } from '../core/routeCollector';

export interface RouteWatchOptions {
  docsPath?: string;
  title?: string;
  version?: string;
  description?: string;
}

const defaultOptions: Required<RouteWatchOptions> = {
  docsPath: '/api-docs',
  title: 'API Documentation',
  version: '1.0.0',
  description: 'Auto-generated API documentation',
};

export function routeWatchMiddleware(options: RouteWatchOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const router = Router();

  router.get(opts.docsPath, (_req: Request, res: Response) => {
    const spec = generateSpec({
      title: opts.title,
      version: opts.version,
      description: opts.description,
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(renderSwaggerUI(opts.docsPath + '/json', opts.title));
  });

  router.get(opts.docsPath + '/json', (_req: Request, res: Response) => {
    const specJSON = generateSpecJSON({
      title: opts.title,
      version: opts.version,
      description: opts.description,
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(specJSON);
  });

  return router;
}

export function watch(definition: RouteDefinition) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    registerRoute(definition);
    next();
  };
}

function renderSwaggerUI(specUrl: string, title: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '${specUrl}', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`;
}
