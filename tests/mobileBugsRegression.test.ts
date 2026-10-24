import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService } from '../src/services/contextDev.js';

describe('Mobile Bugs Regression Verification (Bug 1 & Bug 2)', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  describe('Bug 1: Mobile Navigation Menu Positioning & Usability', () => {
    test('CSS defines navbar geometry variables and safe-area insets', () => {
      assert.ok(css.includes('--nav-top:'), 'CSS must define --nav-top');
      assert.ok(css.includes('--navbar-bottom:'), 'CSS must define --navbar-bottom');
      assert.ok(css.includes('env(safe-area-inset-top'), 'CSS should support safe-area-inset-top');
      assert.ok(css.includes('.navbar {'), 'CSS must style .navbar');
      assert.ok(css.includes('top: var(--nav-top'), 'Navbar must position using --nav-top');
    });

    test('Mobile nav overlay layout starts below navbar and supports scrolling', () => {
      assert.ok(css.includes('.mobile-nav-overlay {'), 'CSS must style .mobile-nav-overlay');
      assert.ok(css.includes('justify-content: flex-start;'), 'Mobile nav must not center vertically to prevent collision with header');
      assert.ok(css.includes('padding-top: calc(var(--navbar-bottom'), 'Mobile nav padding-top must derive from --navbar-bottom');
      assert.ok(css.includes('overflow-y: auto;'), 'Mobile nav overlay must allow vertical scrolling on short screens');
      assert.ok(css.includes('-webkit-overflow-scrolling: touch;'), 'Mobile nav overlay must support smooth touch scrolling');
      assert.ok(css.includes('overscroll-behavior: contain;'), 'Mobile nav overlay must contain scroll chaining');
    });

    test('Mobile nav options maintain accessible touch targets and readable typography', () => {
      assert.ok(css.includes('.mobile-nav-links a {'), 'CSS must style mobile nav links');
      assert.ok(css.includes('min-height: 44px;'), 'Mobile nav links must satisfy minimum 44px touch target');
      assert.ok(css.includes('font-size: clamp('), 'Mobile nav link fonts must use clamp for short and tall screens');
    });

    test('Hamburger button transforms into close icon when opened', () => {
      assert.ok(css.includes('.nav-hamburger[aria-expanded="true"]'), 'Hamburger button must have expanded state animation');
      assert.ok(css.includes('rotate(45deg)'), 'Hamburger top bar must rotate into X');
      assert.ok(css.includes('rotate(-45deg)'), 'Hamburger bottom bar must rotate into X');
    });

    test('Client JS dynamically synchronizes navbar metrics and forces dark theme when menu is open', () => {
      assert.ok(appJs.includes('syncNavbarMetrics'), 'JS must implement syncNavbarMetrics()');
      assert.ok(appJs.includes('--navbar-bottom'), 'JS must set --navbar-bottom on documentElement');
      assert.ok(appJs.includes('openMobileNav'), 'JS must implement openMobileNav()');
      assert.ok(appJs.includes('closeMobileNav'), 'JS must implement closeMobileNav()');
      assert.ok(appJs.includes('data-theme'), 'JS must manage navbar theme');
    });
  });

  describe('Bug 2: Project Cards Swiping on Mobile', () => {
    test('Horizontal window allows horizontal finger swiping and vertical panning', () => {
      assert.ok(
        css.includes('touch-action: pan-x pan-y !important;') || css.includes('touch-action: pan-y pan-x !important;'),
        'Horizontal window must specify touch-action: pan-x pan-y to allow horizontal swiping and vertical scrolling'
      );
      assert.ok(css.includes('overflow-x: auto !important;'), 'Horizontal window must have overflow-x: auto');
      assert.ok(css.includes('scroll-snap-type: x mandatory !important;'), 'Horizontal window must have scroll-snap-type: x mandatory');
      assert.ok(css.includes('-webkit-overflow-scrolling: touch !important;'), 'Horizontal window must have momentum scrolling');
    });

    test('3D perspective and preserve-3d are reset to flat on mobile to avoid gesture drop', () => {
      assert.ok(css.includes('perspective: none !important;'), 'Mobile horizontal window must reset perspective to none');
      assert.ok(css.includes('transform-style: flat !important;'), 'Mobile track must reset transform-style to flat');
    });

    test('Project cards have snap alignment, touch-action, and cover drag suppression', () => {
      assert.ok(css.includes('scroll-snap-align: start !important;'), 'Project cards must snap to start');
      assert.ok(css.includes('touch-action: pan-x pan-y !important;'), 'Project cards must have touch-action: pan-x pan-y');
      assert.ok(css.includes('-webkit-user-drag: none;'), 'Card cover images must suppress native dragging');
    });

    test('All five projects remain present and available in data service', () => {
      const service = new PortfolioService({} as unknown as ContextDevService);
      const projects = service.getProfile().projects;
      const ids = projects.map((p) => p.id);
      assert.deepStrictEqual(
        ids,
        ['clocky', 'expify-beta', 'nomnom', 'alchemy', 'aevique'],
        'All 5 projects (Clocky, Expify Beta, NomNom, Alchemy, AEVIQUE) must remain available in exact order'
      );
    });

    test('Desktop 3D pinned horizontal gallery styles are preserved intact', () => {
      assert.ok(css.includes('perspective: 1200px;'), 'Desktop track perspective must remain 1200px');
      assert.ok(css.includes('transform-style: preserve-3d;'), 'Desktop transform-style must remain preserve-3d');
      assert.ok(appJs.includes('translate3d'), 'Desktop JS must continue to translate horizontal track via translate3d');
    });

    test('Client JS synchronizes scroll position with active card index and progress bar', () => {
      assert.ok(appJs.includes("projectsWindow.addEventListener(\n      'scroll'"), 'projectsWindow must listen to scroll events');
      assert.ok(appJs.includes('updateCarouselControls'), 'Scroll sync must update carousel controls');
      assert.ok(appJs.includes('projectsProgressBar'), 'Scroll sync must update progress bar width');
    });
  });
});
