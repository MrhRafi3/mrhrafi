import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Responsiveness, Accessibility & Motion Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  test('Skip Link and Focus Navigation are accessible', () => {
    // Skip link exists and points to main content
    assert.ok(html.includes('href="#main-content"'), 'Must have skip-to-content link pointing to #main-content');
    assert.ok(html.includes('class="skip-to-content"'), 'Skip link must have class .skip-to-content');
    assert.ok(html.includes('<main id="main-content" tabindex="-1">'), 'Main content must have id="main-content" and tabindex="-1"');

    // CSS defines offscreen position and top focus transition
    assert.ok(css.includes('.skip-to-content {'), 'CSS must define .skip-to-content');
    assert.ok(css.includes('.skip-to-content:focus {'), 'CSS must define .skip-to-content:focus');

    // Focus-visible rings for WCAG 2.2 AA
    assert.ok(css.includes(':focus-visible {'), 'Must have global :focus-visible rule');
    assert.ok(css.includes('.projects-pin-section :focus-visible'), 'Must have high-contrast focus ring for dark sections');
  });

  test('Modal dialog and Mobile Nav meet ARIA dialog specification', () => {
    // Project detail modal
    assert.ok(html.includes('id="project-modal-backdrop"'), 'Modal backdrop must exist');
    assert.ok(html.includes('role="dialog"'), 'Modal must have role="dialog"');
    assert.ok(html.includes('aria-modal="true"'), 'Modal must have aria-modal="true"');
    assert.ok(html.includes('aria-labelledby="modal-project-title"'), 'Modal must link title via aria-labelledby');
    assert.ok(html.includes('aria-label="Close project showcase"'), 'Modal close button must have aria-label');

    // Mobile nav overlay
    assert.ok(html.includes('id="mobile-nav-overlay"'), 'Mobile nav overlay must exist');
    assert.ok(html.includes('aria-label="Mobile Navigation"'), 'Mobile nav overlay must have aria-label');
    assert.ok(html.includes('id="mobile-nav-close"'), 'Mobile nav must have dedicated close button');
    assert.ok(html.includes('aria-label="Close navigation menu"'), 'Mobile nav close must have descriptive aria-label');

    // Hamburger button
    assert.ok(html.includes('aria-expanded="false"'), 'Hamburger must track aria-expanded');
    assert.ok(html.includes('aria-controls="mobile-nav-overlay"'), 'Hamburger must identify controlled overlay');
  });

  test('Fluid typography and responsive breakpoints are properly specified', () => {
    // Fluid typography clamp
    assert.ok(css.includes('font-size: clamp('), 'Headlines must utilize fluid CSS clamp sizing');

    // Key breakpoint definitions
    assert.ok(css.includes('@media (max-width: 1024px)'), 'Must include 1024px tablet/mobile breakpoint');
    assert.ok(css.includes('@media (max-width: 768px)'), 'Must include 768px mobile breakpoint');
    assert.ok(css.includes('@media (max-width: 480px)'), 'Must include 480px small smartphone breakpoint');
    assert.ok(css.includes('@media (max-width: 360px)'), 'Must include 360px compact phone breakpoint');

    // Touch-action on swipe container allowing horizontal swipe and vertical pan
    assert.ok(
      css.includes('touch-action: pan-x pan-y !important;') || css.includes('touch-action: pan-y pan-x !important;'),
      'Horizontal gallery must allow horizontal swiping and vertical pan gestures'
    );
  });

  test('Mobile interactive elements satisfy 44px minimum touch targets', () => {
    assert.ok(css.includes('.nav-hamburger {'), 'CSS must define .nav-hamburger');
    assert.ok(css.includes('min-width: 44px;'), 'Touch targets must have at least 44px min-width');
    assert.ok(css.includes('min-height: 44px;'), 'Touch targets must have at least 44px min-height');
    assert.ok(css.includes('.carousel-arrow-btn {'), 'CSS must define .carousel-arrow-btn');
    assert.ok(css.includes('.btn-card-showcase {'), 'CSS must define .btn-card-showcase');
  });

  test('prefers-reduced-motion is respected across all motion features', () => {
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'CSS must contain reduced motion media query');
    assert.ok(css.includes('.split-wi {'), 'Reduced motion must reset .split-wi');
    assert.ok(css.includes('animation-duration: 0.01ms !important;'), 'Reduced motion must collapse animation durations');

    // JS safeguards
    assert.ok(appJs.includes('prefersReducedMotion'), 'JS must check window.matchMedia for reduced motion');
  });

  test('SEO and metadata standards are fully satisfied', () => {
    assert.ok(html.includes('<meta name="theme-color" content="#2e0cff" />'), 'Must define brand theme-color');
    assert.ok(html.includes('<link rel="canonical" href="https://rafi.dev" />'), 'Must define canonical link');
    assert.ok(html.includes('<meta property="og:title"'), 'Must define OpenGraph title');
    assert.ok(html.includes('<meta property="og:image"'), 'Must define OpenGraph image');
    assert.ok(html.includes('<meta name="twitter:card"'), 'Must define Twitter card');
    assert.ok(html.includes('<link rel="preload" as="image" href="/images/rafi-portrait.jpg" />'), 'Must preload hero portrait');
  });

  test('Client JavaScript provides smooth modal screenshot switching and focus restoration', () => {
    assert.ok(appJs.includes('switchModalScreen'), 'Must include switchModalScreen helper for smooth switching');
    assert.ok(appJs.includes('activeModalTrigger'), 'Must save trigger element to restore focus on close');
    assert.ok(appJs.includes('hero--ready'), 'Must choreograph hero entrance with hero--ready class');
  });
});
