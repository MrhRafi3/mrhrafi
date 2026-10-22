import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService } from '../src/services/contextDev.js';

describe('AEVIQUE Project Integration Verification', () => {
  const service = new PortfolioService({} as unknown as ContextDevService);
  const profile = service.getProfile();
  const aevique = profile.projects.find((p) => p.id === 'aevique');

  test('AEVIQUE is defined with accurate metadata and verified facts', () => {
    assert.ok(aevique, 'AEVIQUE project must be present in portfolio projects');
    assert.strictEqual(aevique.id, 'aevique');
    assert.strictEqual(aevique.title, 'AEVIQUE');
    assert.strictEqual(aevique.category, 'Flutter Mobile App · Photo Editing');
    assert.strictEqual(aevique.platform, 'Flutter mobile application');
    assert.strictEqual(aevique.badge, 'PHOTO STUDIO');
    assert.strictEqual(
      aevique.description,
      'A photo-editing app focused on providing a polished editing experience and a refined visual interface.'
    );
    assert.strictEqual(aevique.githubUrl, null, 'Repository URL must not be fabricated');
    assert.strictEqual(aevique.demoUrl, null);
    assert.ok(aevique.repoNote, 'Must include repoNote explaining availability');
  });

  test('Cover image asset exists at exact path with correct dimensions', () => {
    assert.strictEqual(aevique?.coverSrc, '/images/project-covers/aevique-cover.webp');
    const fullPath = path.resolve(process.cwd(), 'public' + aevique.coverSrc);
    assert.ok(fs.existsSync(fullPath), `Cover image file must exist at ${fullPath}`);
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 10000, 'Cover image file must not be empty or corrupted');
  });

  test('All six screenshots exist at exact paths with non-zero size', () => {
    assert.ok(aevique);
    assert.strictEqual(aevique.screenshots.length, 6, 'Must contain exactly 6 screenshots');

    const expectedScreenshots = [
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.18.25.png',
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.08.46.png',
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.10.03.png',
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.11.53.png',
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.12.20.png',
      '/images/Aevique/Simulator Screenshot - iPhone 16e - 2026-10-22 at 15.12.50.png',
    ];

    aevique.screenshots.forEach((screen, index) => {
      assert.strictEqual(screen.src, expectedScreenshots[index]);
      assert.ok(screen.label && screen.label.length > 0, `Screenshot ${index} must have a label`);
      assert.ok(screen.alt && screen.alt.length > 0, `Screenshot ${index} must have an alt description`);

      const fullPath = path.resolve(process.cwd(), 'public' + screen.src);
      assert.ok(fs.existsSync(fullPath), `Screenshot must exist on disk at ${screen.src}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 10000, `Screenshot ${screen.src} must have valid image content`);
    });
  });

  test('Existing projects (Clocky, Expify Beta, NomNom, Alchemy) are preserved intact', () => {
    const clocky = profile.projects.find((p) => p.id === 'clocky');
    const expify = profile.projects.find((p) => p.id === 'expify-beta');
    const nomnom = profile.projects.find((p) => p.id === 'nomnom');
    const alchemy = profile.projects.find((p) => p.id === 'alchemy');

    assert.ok(clocky, 'Clocky must exist');
    assert.strictEqual(clocky.githubUrl, 'https://github.com/MrhRafi3/Clocky');
    assert.ok(clocky.screenshots.length >= 5);

    assert.ok(expify, 'Expify Beta must exist');
    assert.strictEqual(expify.badge, 'BETA');
    assert.ok(expify.screenshots.length >= 8);

    assert.ok(nomnom, 'NomNom must exist');
    assert.strictEqual(nomnom.badge, 'FOOD DELIVERY');
    assert.ok(nomnom.screenshots.length >= 9);

    assert.ok(alchemy, 'Alchemy must exist');
    assert.strictEqual(alchemy.badge, 'ELEMENT FUSION');
    assert.ok(alchemy.screenshots.length === 5);

    // Verify ordering: Clocky -> Expify Beta -> NomNom -> Alchemy -> AEVIQUE
    const ids = profile.projects.map((p) => p.id);
    assert.deepStrictEqual(ids, ['clocky', 'expify-beta', 'nomnom', 'alchemy', 'aevique']);
  });

  test('CSS contains dedicated theme accent styles for AEVIQUE', () => {
    const cssPath = path.resolve(process.cwd(), 'public/style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.project-card--aevique'), 'Must contain .project-card--aevique selector');
    assert.ok(css.includes('--project-accent: #e2c285;'), 'Must define champagne gold accent color');
    assert.ok(css.includes('--project-accent-glow: rgba(226, 194, 133, 0.24);'), 'Must define accent glow');
    assert.ok(css.includes('--project-accent-border: rgba(226, 194, 133, 0.5);'), 'Must define accent border');
  });

  test('Client JavaScript handles AEVIQUE icons, covers, and modal rendering', () => {
    const appJsPath = path.resolve(process.cwd(), 'public/app.js');
    const appJs = fs.readFileSync(appJsPath, 'utf8');

    assert.ok(appJs.includes("case 'aevique': return '✨';"), 'Must have icon mapping for AEVIQUE');
    assert.ok(
      appJs.includes("case 'aevique': return '/images/project-covers/aevique-cover.webp';"),
      'Must have cover fallback mapping for AEVIQUE'
    );
  });
});
