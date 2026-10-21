import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService, ScrapeResponse, BrandSearchResponse } from '../src/services/contextDev.js';
import { createApp } from '../src/server.js';
import type { Server } from 'http';

describe('PortfolioService & Express App (Mocked)', () => {
  // Create a mock instance of ContextDevService
  const mockContextDev = {
    async scrape(params: { url: string }): Promise<ScrapeResponse> {
      return {
        url: params.url,
        markdown: {
          requested: true,
          success: true,
          data: '# My Awesome Project\n\nFull stack application with realtime synchronization and analytics.',
        },
        metadata: {
          title: 'My Awesome Project Title',
          description: 'A cutting-edge web project.',
        },
        request_id: 'mock-scrape-req-123',
      };
    },
    async searchBrands(query: string): Promise<BrandSearchResponse> {
      return {
        brands: [
          {
            name: query.toUpperCase(),
            domain: `${query.toLowerCase()}.com`,
            description: `Official brand for ${query}`,
          },
        ],
        request_id: 'mock-brand-req-456',
      };
    },
    async extractStyleguide(domain: string) {
      return {
        domain,
        styleguide: {
          colors: { primary: '#38bdf8', background: '#0b0f19' },
          typography: { headings: { h1: '32px' } },
        },
        request_id: 'mock-styleguide-req-789',
      };
    },
  } as unknown as ContextDevService;

  test('PortfolioService returns profile with projects and clients', () => {
    const service = new PortfolioService(mockContextDev);
    const profile = service.getProfile();

    assert.equal(profile.name, 'Mrh Rafi');
    assert.equal(profile.email, 'mrhrafi99@gmail.com');
    assert.equal(profile.links.github, 'https://github.com/mrhrafi3');
    assert.equal(profile.links.linkedin, 'https://bd.linkedin.com/in/mrhrafi');
    assert.ok(profile.skills.includes('Flutter'));
    assert.ok(profile.skills.includes('Dart'));
    assert.ok(profile.skills.includes('C++'));
    assert.ok(profile.skills.includes('Data Structures & Algorithms'));

    assert.equal(profile.projects.length, 3);
    const [clocky, expify, nomnom] = profile.projects;
    assert.equal(clocky.id, 'clocky');
    assert.equal(clocky.githubUrl, 'https://github.com/MrhRafi3/Clocky');
    assert.ok(clocky.screenshots.length >= 5);

    assert.equal(expify.id, 'expify-beta');
    assert.equal(expify.badge, 'BETA');
    assert.ok(expify.screenshots.length >= 8);

    assert.equal(nomnom.id, 'nomnom');
    assert.ok(nomnom.screenshots.length >= 9);
  });

  test('PortfolioService enriches project via scrape', async () => {
    const service = new PortfolioService(mockContextDev);
    const enriched = await service.enrichProject('clocky');

    assert.equal(enriched.id, 'clocky');
    assert.ok(enriched.enriched);
    assert.equal(enriched.enriched.resolvedTitle, 'My Awesome Project Title');
    assert.ok(enriched.enriched.markdownExcerpt?.includes('My Awesome Project'));
    assert.equal(enriched.enriched.requestId, 'mock-scrape-req-123');
  });

  test('PortfolioService enriches client brands via searchBrands', async () => {
    const service = new PortfolioService(mockContextDev);
    const brands = await service.enrichClientBrand('github');

    assert.equal(brands.length, 1);
    assert.equal(brands[0].name, 'GITHUB');
    assert.equal(brands[0].domain, 'github.com');
  });

  test('Express API endpoints respond correctly with mocked service', async () => {
    process.env.VERIFY_RUN = 'true';
    const service = new PortfolioService(mockContextDev);
    const app = createApp(service);

    const server: Server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      // 1. Health check
      const healthRes = await fetch(`${baseUrl}/api/health`);
      assert.equal(healthRes.status, 200);
      const healthData = await healthRes.json();
      assert.equal(healthData.status, 'ok');

      // 2. Portfolio profile
      const portRes = await fetch(`${baseUrl}/api/portfolio`);
      assert.equal(portRes.status, 200);
      const portData = await portRes.json();
      assert.equal(portData.name, 'Mrh Rafi');

      // 3. Enrich project
      const enrichRes = await fetch(`${baseUrl}/api/portfolio/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'clocky' }),
      });
      assert.equal(enrichRes.status, 200);
      const enrichData = await enrichRes.json();
      assert.equal(enrichData.success, true);
      assert.equal(enrichData.project.enriched.resolvedTitle, 'My Awesome Project Title');

      // 4. Client brand
      const brandRes = await fetch(`${baseUrl}/api/portfolio/client-brand?query=stripe`);
      assert.equal(brandRes.status, 200);
      const brandData = await brandRes.json();
      assert.equal(brandData.success, true);
      assert.equal(brandData.brands[0].name, 'STRIPE');

      // 5. Styleguide
      const styleRes = await fetch(`${baseUrl}/api/portfolio/styleguide?domain=stripe.com`);
      assert.equal(styleRes.status, 200);
      const styleData = await styleRes.json();
      assert.equal(styleData.success, true);
      assert.equal(styleData.domain, 'stripe.com');
      assert.equal(styleData.styleguide.styleguide.colors.primary, '#38bdf8');
    } finally {
      server.close();
    }
  });
});
