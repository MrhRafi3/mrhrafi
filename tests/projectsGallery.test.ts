import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService } from '../src/services/contextDev.js';

describe('Projects Gallery Redesign Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  test('Project cover images exist on disk and are accessible', () => {
    const covers = [
      'public/images/project-covers/clocky-cover.webp',
      'public/images/project-covers/expify-cover.webp',
      'public/images/project-covers/nomnom-cover.webp',
      'public/images/project-covers/alchemy-cover.webp',
    ];
    covers.forEach((relPath) => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Cover image must exist at ${relPath}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 1000, `Cover image ${relPath} must not be empty`);
    });
  });

  test('All five Alchemy screenshots exist on disk and are accessible', () => {
    const screenshots = [
      'public/images/alchemy/home.png',
      'public/images/alchemy/discover.png',
      'public/images/alchemy/element-detail.png',
      'public/images/alchemy/collection.png',
      'public/images/alchemy/profile.png',
    ];
    screenshots.forEach((relPath) => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert.ok(fs.existsSync(fullPath), `Screenshot must exist at ${relPath}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 1000, `Screenshot ${relPath} must not be empty`);
    });
  });

  test('PortfolioService supplies coverSrc for all projects', () => {
    const service = new PortfolioService({} as unknown as ContextDevService);
    const profile = service.getProfile();
    const projects = profile.projects;

    assert.strictEqual(projects.length, 4, 'Must have 4 projects');
    const clocky = projects.find((p) => p.id === 'clocky');
    const expify = projects.find((p) => p.id === 'expify-beta');
    const nomnom = projects.find((p) => p.id === 'nomnom');
    const alchemy = projects.find((p) => p.id === 'alchemy');

    assert.ok(clocky?.coverSrc?.includes('clocky-cover.webp'), 'Clocky must have clocky-cover.webp');
    assert.ok(expify?.coverSrc?.includes('expify-cover.webp'), 'Expify must have expify-cover.webp');
    assert.ok(nomnom?.coverSrc?.includes('nomnom-cover.webp'), 'NomNom must have nomnom-cover.webp');
    assert.ok(alchemy?.coverSrc?.includes('alchemy-cover.webp'), 'Alchemy must have alchemy-cover.webp');

    // Verify modal original screenshots are preserved
    assert.ok(clocky && clocky.screenshots.length >= 5, 'Clocky must preserve detail screenshots');
    assert.ok(expify && expify.screenshots.length >= 5, 'Expify must preserve detail screenshots');
    assert.ok(nomnom && nomnom.screenshots.length >= 4, 'NomNom must preserve detail screenshots');
    assert.ok(alchemy && alchemy.screenshots.length === 5, 'Alchemy must have exactly 5 detail screenshots');
  });

  test('Projects section has deep charcoal/near-black theme and data-ground="ink"', () => {
    assert.ok(html.includes('id="projects" data-ground="ink"'), 'Projects section must have data-ground="ink"');
    assert.ok(css.includes('.projects-pin-section {'), 'CSS must define .projects-pin-section');
    assert.ok(css.includes('background: #0c0d12;'), 'CSS must specify deep charcoal background');
  });

  test('CSS defines 16:9 ratio, 3D floating depth, and coordinated accents', () => {
    // 16:9 aspect ratio
    assert.ok(css.includes('aspect-ratio: 16 / 9;'), 'Must preserve 16:9 aspect ratio');
    assert.ok(css.includes('object-fit: cover;'), 'Must use object-fit: cover for covers');

    // 3D perspective and depth
    assert.ok(css.includes('perspective: 1200px;'), 'Track must have 3D perspective');
    assert.ok(css.includes('transform-style: preserve-3d;'), 'Must support 3D transform style');
    assert.ok(css.includes('box-shadow: 0 16px 36px -8px'), 'Card must have layered shadow depth');

    // Coordinated accents for each project
    assert.ok(css.includes('.project-card--clocky'), 'Clocky accent class must exist');
    assert.ok(css.includes('--project-accent: #f5dfa8;'), 'Clocky warm cream/gold accent must exist');

    assert.ok(css.includes('.project-card--expify-beta'), 'Expify accent class must exist');
    assert.ok(css.includes('--project-accent: #38bdf8;'), 'Expify electric blue accent must exist');

    assert.ok(css.includes('.project-card--nomnom'), 'NomNom accent class must exist');
    assert.ok(css.includes('--project-accent: #ff9f1c;'), 'NomNom warm yellow/orange accent must exist');

    assert.ok(css.includes('.project-card--alchemy'), 'Alchemy accent class must exist');
    assert.ok(css.includes('--project-accent: #a78bfa;'), 'Alchemy purple accent must exist');
  });

  test('JavaScript handles graceful cover fallback and card tilt interaction', () => {
    assert.ok(appJs.includes('card-cover-placeholder'), 'Must provide card-cover-placeholder fallback');
    assert.ok(appJs.includes('initProjectCardTilt'), 'Must implement interactive 3D card tilt');
    assert.ok(appJs.includes('getCardStep'), 'Must dynamically calculate carousel step');
  });
});
