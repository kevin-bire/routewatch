import { Request, Response } from 'express';
import { getRoutes } from '../core/routeCollector';
import { exportSpecToFile, ExportFormat } from '../core/routeExporter';

export interface ExportHandlerOptions {
  defaultFormat?: ExportFormat;
  allowedFormats?: ExportFormat[];
}

const DEFAULT_OPTIONS: Required<ExportHandlerOptions> = {
  defaultFormat: 'json',
  allowedFormats: ['json', 'yaml'],
};

export function createExportHandler(options: ExportHandlerOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return function exportHandler(req: Request, res: Response): void {
    const formatParam = (req.query.format as string | undefined)?.toLowerCase();
    const format: ExportFormat =
      formatParam && opts.allowedFormats.includes(formatParam as ExportFormat)
        ? (formatParam as ExportFormat)
        : opts.defaultFormat;

    const routes = getRoutes();

    if (routes.length === 0) {
      res.status(404).json({ error: 'No routes registered' });
      return;
    }

    try {
      const { content, mimeType, filename } = exportSpecToFile(routes, {
        format,
        pretty: true,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(content);
    } catch (err) {
      res.status(500).json({ error: 'Failed to export spec', details: String(err) });
    }
  };
}

export function registerExportRoute(
  app: { get: (path: string, handler: (req: Request, res: Response) => void) => void },
  path = '/routewatch/export',
  options: ExportHandlerOptions = {}
): void {
  app.get(path, createExportHandler(options));
}
