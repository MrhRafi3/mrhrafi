import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PortfolioService } from './services/portfolioService.js';
import { ContextDevApiError } from './services/contextDev.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(portfolioService?: PortfolioService) {
  const app = express();
  const service = portfolioService || new PortfolioService();

  app.use(express.json());

  // Static assets
  const publicDir = path.resolve(__dirname, '../public');
  app.use(express.static(publicDir));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    const hasKey = Boolean(process.env.CONTEXT_DEV_API_KEY);
    res.json({
      status: 'ok',
      service: 'portfolio-website',
      contextDevConfigured: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Get developer profile and portfolio projects
  app.get('/api/portfolio', (_req: Request, res: Response) => {
    const profile = service.getProfile();
    res.json(profile);
  });

  // Enrich project with live metadata from Context.dev POST /web/scrape
  app.post('/api/portfolio/enrich', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, url } = req.body;
      const target = projectId || url;
      if (!target) {
        res.status(400).json({ error: 'Missing projectId or url parameter' });
        return;
      }
      const enrichedProject = await service.enrichProject(target);
      res.json({ success: true, project: enrichedProject });
    } catch (err) {
      next(err);
    }
  });

  // Search client / partner brand intelligence via Context.dev GET /brand/search
  app.get('/api/portfolio/client-brand', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        res.status(400).json({ error: 'Missing query parameter for brand search' });
        return;
      }
      const brands = await service.enrichClientBrand(query);
      res.json({ success: true, query, brands });
    } catch (err) {
      next(err);
    }
  });

  // Inspect design styleguide for case study via Context.dev GET /web/styleguide
  app.get('/api/portfolio/styleguide', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const domain = req.query.domain as string;
      const scheme = req.query.colorScheme as 'light' | 'dark' | undefined;
      if (!domain) {
        res.status(400).json({ error: 'Missing domain parameter for styleguide' });
        return;
      }
      const styleguide = await service.inspectStyleguide(domain, scheme);
      res.json({ success: true, domain, styleguide });
    } catch (err) {
      next(err);
    }
  });

  // Central error handling middleware - NEVER leaks API keys or secrets
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ContextDevApiError) {
      res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({
        error: 'ContextDevApiError',
        status: err.status,
        code: err.errorCode,
        message: err.message,
        requestId: err.requestId,
      });
      return;
    }

    res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'An unexpected error occurred',
    });
  });

  return app;
}

export function startServer(port = process.env.PORT || 3000) {
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Portfolio server is running at http://localhost:${port}`);
  });
  return server;
}
