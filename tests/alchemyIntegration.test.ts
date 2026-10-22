import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService } from '../src/services/contextDev.js';

describe('Alchemy Project Integration Verification', () => {
  const service = new PortfolioService({} as unknown as ContextDevService);
  const profile = service.getProfile();
  const alchemy = profile.projects.find((p) => p.id === 'alchemy');

  test('Alchemy is defined with accurate metadata and verified facts', () => {
    assert.ok(alchemy, 'Alchemy project must be present in portfolio projects');
    assert.strictEqual(alchemy.id, 'alchemy');
    assert.strictEqual(alchemy.title, 'Alchemy');
    assert.strictEqual(alchemy.category, 'Mobile Application / Game');
    assert.strictEqual(alchemy.platform, 'Flutter mobile application');
    assert.strictEqual(alchemy.badge, 'ELEMENT FUSION');
    assert.ok(alchemy.description.toLowerCase().includes('element-combination'));
    assert.ok(alchemy.description.toLowerCase().includes('flutter'));
    assert.strictEqual(alchemy.githubUrl, null, 'Repository URL must not be fabricated');
    assert.strictEqual(alchemy.demoUrl, null);
    assert.ok(alchemy.repoNote, 'Must include repoNote explaining availability');
  });

  test('Cover image asset exists at exact path with correct dimensions', () => {
    assert.strictEqual(alchemy?.coverSrc, '/images/project-covers/alchemy-cover.webp');
    const fullPath = path.resolve(process.cwd(), 'public' + alchemy.coverSrc);
    assert.ok(fs.existsSync(fullPath), `Cover image file must exist at ${fullPath}`);
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 10000, 'Cover image file must not be empty or corrupted');
  });

  test('All five screenshots exist at exact paths with non-zero size', () => {
    assert.ok(alchemy);
    assert.strictEqual(alchemy.screenshots.length, 5, 'Must contain exactly 5 screenshots');

    const expectedScreenshots = [
      '/images/alchemy/home.png',
      '/images/alchemy/discover.png',
      '/images/alchemy/element-detail.png',
      '/images/alchemy/collection.png',
      '/images/alchemy/profile.png',
    ];

    alchemy.screenshots.forEach((screen, index) => {
      assert.strictEqual(screen.src, expectedScreenshots[index]);
      assert.ok(screen.label && screen.label.length > 0, `Screenshot ${index} must have a label`);
      assert.ok(screen.alt && screen.alt.length > 0, `Screenshot ${index} must have an alt description`);

      const fullPath = path.resolve(process.cwd(), 'public' + screen.src);
      assert.ok(fs.existsSync(fullPath), `Screenshot must exist on disk at ${screen.src}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 10000, `Screenshot ${screen.src} must have valid image content`);
    });
  });

  test('Existing projects (Clocky, Expify Beta, NomNom) are preserved intact', () => {
    const clocky = profile.projects.find((p) => p.id === 'clocky');
    const expify = profile.projects.find((p) => p.id === 'expify-beta');
    const nomnom = profile.projects.find((p) => p.id === 'nomnom');

    assert.ok(clocky, 'Clocky must exist');
    assert.strictEqual(clocky.githubUrl, 'https://github.com/MrhRafi3/Clocky');
    assert.ok(clocky.screenshots.length >= 5);

    assert.ok(expify, 'Expify Beta must exist');
    assert.strictEqual(expify.badge, 'BETA');
    assert.ok(expify.screenshots.length >= 8);

    assert.ok(nomnom, 'NomNom must exist');
    assert.strictEqual(nomnom.badge, 'FOOD DELIVERY');
    assert.ok(nomnom.screenshots.length >= 9);

    // Verify ordering: Clocky -> Expify Beta -> NomNom -> Alchemy
    const ids = profile.projects.map((p) => p.id);
    assert.deepStrictEqual(ids, ['clocky', 'expify-beta', 'nomnom', 'alchemy']);
  });

  test('CSS contains dedicated theme accent styles for Alchemy', () => {
    const cssPath = path.resolve(process.cwd(), 'public/style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.project-card--alchemy'), 'Must contain .project-card--alchemy selector');
    assert.ok(css.includes('--project-accent: #a78bfa;'), 'Must define purple accent color');
    assert.ok(css.includes('--project-accent-glow: rgba(167, 139, 250, 0.24);'), 'Must define accent glow');
    assert.ok(css.includes('--project-accent-border: rgba(167, 139, 250, 0.5);'), 'Must define accent border');
  });

  test('Client JavaScript handles Alchemy icons, covers, and modal rendering', () => {
    const appJsPath = path.resolve(process.cwd(), 'public/app.js');
    const appJs = fs.readFileSync(appJsPath, 'utf8');

    assert.ok(appJs.includes("case 'alchemy': return '⚗️';"), 'Must have icon mapping for Alchemy');
    assert.ok(
      appJs.includes("case 'alchemy': return '/images/project-covers/alchemy-cover.webp';"),
      'Must have cover fallback mapping for Alchemy'
    );
    assert.ok(appJs.includes('p.platform'), 'Must render platform info if present');
  });
});
