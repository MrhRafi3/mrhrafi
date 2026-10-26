import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 5: Cinematic Opening Sequence Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  test('Cinematic intro element exists in index.html with accessible semantic structure', () => {
    assert.ok(html.includes('id="cinematic-intro"'), 'HTML must contain element with id="cinematic-intro"');
    assert.ok(html.includes('class="cinematic-intro"'), 'Cinematic intro must have class .cinematic-intro');

    // Skip button
    assert.ok(html.includes('id="intro-skip-btn"'), 'Must contain Skip Intro button with id="intro-skip-btn"');
    assert.ok(
      html.includes('aria-label="Skip introductory sequence"'),
      'Skip button must have descriptive aria-label'
    );

    // Portrait reveal
    assert.ok(html.includes('class="intro-portrait-stage"'), 'Must contain portrait stage container');
    assert.ok(html.includes('src="/images/rafi-portrait.jpg"'), 'Must reuse existing portrait asset');

    // Typography & subtitle
    assert.ok(html.includes('MRH RAFI'), 'Must reveal developer identity MRH RAFI');
    assert.ok(html.includes('Flutter App Developer'), 'Must state Flutter App Developer in subtitle');
    assert.ok(html.includes('Mobile UI Engineer'), 'Must state Mobile UI Engineer in subtitle');

    // Decorative elements hidden from screen readers
    assert.ok(html.includes('class="cinematic-intro-bg" aria-hidden="true"'), 'Background glows must be aria-hidden');
    assert.ok(html.includes('class="intro-timeline-track" aria-hidden="true"'), 'Timeline track must be aria-hidden');
  });

  test('CSS defines full-screen cinematic overlay, lighting atmosphere, and fail-safe fallback', () => {
    assert.ok(css.includes('.cinematic-intro {'), 'CSS must define .cinematic-intro');
    assert.ok(css.includes('position: fixed;'), 'Intro must be fixed overlay');
    assert.ok(css.includes('z-index: 99999;'), 'Intro must overlay page during active playback');
    assert.ok(css.includes('radial-gradient('), 'Intro must utilize cinematic radial lighting');

    // Skip button focus ring
    assert.ok(css.includes('.intro-skip-btn:focus-visible {'), 'Skip button must define :focus-visible focus ring');

    // Exiting and Finished states
    assert.ok(css.includes('.cinematic-intro.intro--exiting'), 'CSS must define .intro--exiting transition');
    assert.ok(css.includes('.cinematic-intro.intro--finished'), 'CSS must define .intro--finished hiding');

    // CSS fail-safe auto-dismiss in case JS fails
    assert.ok(css.includes('@keyframes introAutoDismiss'), 'CSS must define fail-safe auto-dismiss keyframes');

    // Reduced motion support
    assert.ok(
      css.includes('.cinematic-intro {') &&
      css.includes('@media (prefers-reduced-motion: reduce)') &&
      css.includes('display: none !important;'),
      'CSS must immediately bypass intro when prefers-reduced-motion is active'
    );
  });

  test('Client JavaScript implements visitor control, repeat-visit bypass, and smooth hero transition', () => {
    assert.ok(appJs.includes('initCinematicIntro'), 'appJs must define initCinematicIntro()');
    assert.ok(appJs.includes('mrh_intro_seen'), 'appJs must use session storage key mrh_intro_seen');
    assert.ok(appJs.includes('prefers-reduced-motion'), 'appJs must detect prefers-reduced-motion');
    assert.ok(appJs.includes('hero--ready'), 'appJs must trigger hero--ready upon intro completion');
    assert.ok(appJs.includes('intro--finished'), 'appJs must apply intro--finished class');
    assert.ok(appJs.includes('Escape'), 'appJs must allow dismiss via Escape key');
  });
});
