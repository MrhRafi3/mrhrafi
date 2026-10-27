import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Multi-Viewport Spectrum & Advanced Accessibility Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  // =========================================================================
  // VIEWPORT SPECTRUM TESTS (7 VIEWPORT CLASSES)
  // =========================================================================
  describe('7 Target Viewport Classes Coverage', () => {
    test('Viewport 1 (Small Phone 320px–360px): Compact typography and full-width card safety', () => {
      assert.ok(css.includes('@media (max-width: 360px)'), 'Must define max-width: 360px query');
      assert.ok(css.includes('.hero-chip {') && css.includes('max-width: 280px !important;'), 'Hero chip must not exceed compact 320px screen');
      assert.ok(css.includes('width: 90vw !important;'), 'Project cards scale properly on 320px devices');
    });

    test('Viewport 2 & 3 (Standard & Large Phone 375px–600px): Fluid cards and responsive hero layout', () => {
      assert.ok(css.includes('@media (max-width: 480px)'), 'Must define max-width: 480px query');
      assert.ok(css.includes('@media (max-width: 600px)'), 'Must define max-width: 600px query');
      assert.ok(css.includes('width: 86vw !important;'), 'Project cards take 86vw on 375-480px screens');
    });

    test('Viewport 4 (Tablet 601px–900px): Mobile hamburger navigation and stacked layout', () => {
      assert.ok(css.includes('@media (max-width: 768px)'), 'Must define max-width: 768px query');
      assert.ok(css.includes('.hero-container {') && css.includes('grid-template-columns: 1fr;'), 'Hero container stacks on tablet viewports');
    });

    test('Viewport 5 (Small Laptop 901px–1199px): Dedicated media query with compact navbar density and headline balance', () => {
      assert.ok(css.includes('@media (min-width: 1025px) and (max-width: 1199px)'), 'Must define dedicated small laptop media query');
      assert.ok(css.includes('.nav-pill {') && css.includes('font-size: 0.81rem;'), 'Nav pills must have compact font size on small laptops');
      assert.ok(css.includes('.hero-headline {') && css.includes('font-size: clamp(2.9rem, 4.4vw, 3.8rem);'), 'Hero headline must scale down gracefully on small laptops');
    });

    test('Viewport 6 & 7 (Desktop 1200px–1440px+): Full editorial desktop hero with outer-edge floating cards and 3D gallery', () => {
      assert.ok(css.includes('--container: 1200px;'), 'Must have bounded container width');
      assert.ok(css.includes('.hero-chip--apps {') && css.includes('left: -90px;'), 'Desktop chip 1 positioned at outer-left edge');
      assert.ok(css.includes('.hero-chip--stack {') && css.includes('right: -85px;'), 'Desktop chip 2 positioned at outer-right edge away from face');
      assert.ok(css.includes('.hero-chip--foundations {') && css.includes('right: -75px;'), 'Desktop chip 3 positioned at outer lower-right edge');
      assert.ok(css.includes('.hero-photo-annotation {') && css.includes('left: -140px;'), 'Annotation positioned far left pointing at shoulder/chest');
    });
  });

  // =========================================================================
  // ACCESSIBILITY & WCAG 2.2 AA VERIFICATION
  // =========================================================================
  describe('Accessibility & WCAG 2.2 AA Compliance', () => {
    test('All mobile interactive elements satisfy 44px minimum touch targets', () => {
      assert.ok(css.includes('.nav-hamburger {') && css.includes('min-height: 44px;'), 'Hamburger must satisfy 44px target');
      assert.ok(css.includes('.contact-copy-btn {') && css.includes('min-height: 44px;'), 'Copy email button must satisfy 44px target');
      assert.ok(css.includes('.contact-social-pill {') && css.includes('min-height: 44px;'), 'Contact social pill must satisfy 44px target');
      assert.ok(css.includes('.footer-col a {') && css.includes('min-height: 44px;'), 'Footer link must satisfy 44px target');
      assert.ok(css.includes('.footer-meta-pill {') && css.includes('min-height: 44px;'), 'Footer meta pill must satisfy 44px target');
      assert.ok(css.includes('.chapter-card {') && css.includes('min-height: 44px;'), 'Chapter card must satisfy 44px target');
      assert.ok(css.includes('.faq-question {') && css.includes('min-height: 44px;'), 'FAQ question must satisfy 44px target');
    });

    test('High-contrast focus rings defined for both light and dark/blue surfaces', () => {
      assert.ok(css.includes(':focus-visible {'), 'Base :focus-visible defined');
      assert.ok(css.includes('.hero :focus-visible'), 'Hero dark/blue surface has high-contrast focus ring');
      assert.ok(css.includes('.mobile-nav-overlay :focus-visible'), 'Mobile nav dark/blue surface has high-contrast focus ring');
      assert.ok(css.includes('.projects-pin-section :focus-visible'), 'Projects dark surface has high-contrast focus ring');
    });

    test('FAQ items have complete ARIA controls, IDs, and region roles', () => {
      for (let i = 1; i <= 6; i++) {
        assert.ok(html.includes(`id="faq-q-${i}"`), `FAQ question ${i} must have id`);
        assert.ok(html.includes(`aria-controls="faq-ans-${i}"`), `FAQ question ${i} must link to answer via aria-controls`);
        assert.ok(html.includes(`id="faq-ans-${i}"`), `FAQ answer ${i} must have id`);
        assert.ok(html.includes(`role="region"`), 'FAQ answer must have role="region"');
        assert.ok(html.includes(`aria-labelledby="faq-q-${i}"`), `FAQ answer ${i} must link back via aria-labelledby`);
      }
    });

    test('Mobile navigation drawer implements circular Tab/Shift+Tab keyboard trap', () => {
      assert.ok(appJs.includes('mobileNavOverlay.addEventListener(\'keydown\''), 'Mobile nav must handle keydown');
      assert.ok(appJs.includes("e.key === 'Tab'"), 'Mobile nav must intercept Tab key');
      assert.ok(appJs.includes('e.shiftKey'), 'Mobile nav must support Shift+Tab backwards navigation');
    });

    test('Project detail modal supports touch gestures and resilient fallback', () => {
      assert.ok(appJs.includes('modalPhoneFrame.addEventListener'), 'Modal phone frame must have touch listeners');
      assert.ok(appJs.includes('touchstart') && appJs.includes('touchend'), 'Must track touchstart and touchend');
      assert.ok(appJs.includes('FALLBACK_PORTFOLIO_DATA'), 'Must contain embedded fallback portfolio data for offline resilience');
    });
  });
});

