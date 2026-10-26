import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 4: Portfolio Chapters Shelf Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  test('Portfolio Chapters section is placed immediately after #about and before #skills', () => {
    const aboutIdx = html.indexOf('id="about"');
    const chaptersIdx = html.indexOf('id="chapters"');
    const skillsIdx = html.indexOf('id="skills"');

    assert.ok(aboutIdx !== -1, 'Section #about must exist in index.html');
    assert.ok(chaptersIdx !== -1, 'Section #chapters must exist in index.html');
    assert.ok(skillsIdx !== -1, 'Section #skills must exist in index.html');

    assert.ok(
      aboutIdx < chaptersIdx && chaptersIdx < skillsIdx,
      'Section #chapters must be placed after #about and before #skills'
    );

    // Section attributes
    assert.ok(
      html.includes('class="chapters-shelf-section reveal-on-scroll" id="chapters" data-ground="white"'),
      '#chapters section must have correct classes, id, and data-ground="white"'
    );
  });

  test('All 5 required chapter targets (#skills, #tags, #projects, #process, #contact) exist in navigation cards', () => {
    const expectedTargets = ['skills', 'tags', 'projects', 'process', 'contact'];

    expectedTargets.forEach((targetId, index) => {
      const chapterNum = `CH 0${index + 1}`;
      assert.ok(
        html.includes(`data-target="${targetId}"`),
        `Chapters shelf must contain card with data-target="${targetId}"`
      );
      assert.ok(
        html.includes(`href="#${targetId}"`),
        `Chapters shelf card must have href="#${targetId}"`
      );
      assert.ok(
        html.includes(chapterNum),
        `Chapters shelf must display chapter number ${chapterNum}`
      );
      // Ensure the target element exists in index.html
      const regex = new RegExp(`id=["']${targetId}["']`);
      assert.ok(regex.test(html), `Target element with id="${targetId}" must exist in index.html`);
    });
  });

  test('Every chapter card satisfies accessibility standards (ARIA, progressbar, visible text)', () => {
    const expectedTargets = ['skills', 'tags', 'projects', 'process', 'contact'];

    expectedTargets.forEach((targetId) => {
      // Accessible progressbar
      assert.ok(
        html.includes(`id="chap-bar-${targetId}"`),
        `Progressbar for ${targetId} must exist`
      );
      assert.ok(
        html.includes(`role="progressbar"`),
        'Progress element must have role="progressbar"'
      );
      assert.ok(
        html.includes('aria-valuemin="0"'),
        'Progress element must specify aria-valuemin="0"'
      );
      assert.ok(
        html.includes('aria-valuemax="100"'),
        'Progress element must specify aria-valuemax="100"'
      );
      // Visible text percentage
      assert.ok(
        html.includes(`id="chap-val-${targetId}"`),
        `Visible progress value element for ${targetId} must exist`
      );
    });

    // Semantic navigation container
    assert.ok(
      html.includes('<nav class="chapters-grid" aria-label="Portfolio chapters navigation">'),
      'Chapters grid must be wrapped in a semantic nav element with accessible label'
    );
  });

  test('CSS rules properly handle desktop 5-col grid and responsive breakpoints down to 320px', () => {
    assert.ok(css.includes('.chapters-shelf-section {'), 'CSS must define .chapters-shelf-section');
    assert.ok(css.includes('.chapters-shelf-card {'), 'CSS must define .chapters-shelf-card');
    assert.ok(css.includes('grid-template-columns: repeat(5, 1fr);'), 'Desktop layout must feature 5 columns');
    assert.ok(css.includes('touch-action: pan-y;'), 'Chapter cards must allow natural vertical scroll with touch-action: pan-y');

    // Tablet breakpoint (1024px)
    assert.ok(css.includes('grid-template-columns: repeat(3, 1fr);'), 'Tablet layout must adapt to 3 columns');

    // Mobile wide breakpoint (768px)
    assert.ok(css.includes('grid-template-columns: repeat(2, 1fr);'), 'Mobile landscape/tablet must adapt to 2 columns');

    // Small mobile breakpoint (480px) - vertical stack, no horizontal overflow
    assert.ok(css.includes('grid-template-columns: 1fr;'), 'Small mobile must stack vertically in 1 column');

    // Reduced motion support
    assert.ok(
      css.includes('.chapter-progress-fill {') &&
      css.includes('@media (prefers-reduced-motion: reduce)'),
      'CSS must respect prefers-reduced-motion for chapter animations'
    );
  });

  test('Client JavaScript implements real scroll depth calculation and updates progress throttled by rAF', () => {
    assert.ok(appJs.includes('initPortfolioChapters'), 'appJs must define initPortfolioChapters()');
    assert.ok(appJs.includes('updatePortfolioChapters'), 'appJs must define updatePortfolioChapters()');
    assert.ok(appJs.includes('getBoundingClientRect()'), 'JS must use getBoundingClientRect() for real bounding calculation');
    assert.ok(appJs.includes('Math.max(0, Math.min(1,'), 'JS must clamp progress ratio between 0 and 1');
    assert.ok(appJs.includes('aria-valuenow'), 'JS must update aria-valuenow on progressbar');
    assert.ok(appJs.includes('chapter-card--completed'), 'JS must add completion class when exploration reaches 100%');
    assert.ok(appJs.includes('scrollIntoView'), 'JS must support smooth scroll on chapter card click');
  });
});
