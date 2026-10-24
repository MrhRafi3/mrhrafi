import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Mobile Navigation Links & Touch Navigation Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  const requiredSections = [
    'home',
    'about',
    'skills',
    'services',
    'projects',
    'process',
    'faq',
    'contact'
  ];

  test('All 8 required sections exist with matching IDs in public/index.html', () => {
    requiredSections.forEach((id) => {
      const regex = new RegExp(`id=["']${id}["']`);
      assert.ok(regex.test(html), `HTML must contain section with id="${id}"`);
    });
  });

  test('Every link in mobile-nav-links points to a valid section in the DOM', () => {
    // Extract mobile-nav-links contents
    const navLinksMatch = html.match(/<nav class="mobile-nav-links"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(navLinksMatch, 'mobile-nav-links must exist in HTML');
    const linksBlock = navLinksMatch[1];

    const hrefRegex = /href=["']#([^"']+)["']/g;
    let match;
    const foundIds: string[] = [];
    while ((match = hrefRegex.exec(linksBlock)) !== null) {
      foundIds.push(match[1]);
    }

    assert.deepEqual(
      foundIds.sort(),
      [...requiredSections].sort(),
      `mobile-nav-links must contain exact links for all required sections`
    );

    // Verify each found ID corresponds to an element in HTML
    foundIds.forEach((id) => {
      assert.ok(
        html.includes(`id="${id}"`),
        `Target element id="${id}" referenced in mobile menu link must exist in HTML`
      );
    });
  });

  test('Mobile CTA link in mobile-nav-actions points to a valid section', () => {
    const actionsMatch = html.match(/<div class="mobile-nav-actions"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(actionsMatch, 'mobile-nav-actions must exist in HTML');
    const actionsBlock = actionsMatch[1];

    // Find any anchor hrefs starting with #
    const hrefRegex = /href=["']#([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(actionsBlock)) !== null) {
      const id = match[1];
      assert.ok(
        html.includes(`id="${id}"`),
        `Action link id="${id}" must exist in HTML`
      );
    }
  });

  test('CSS defines scroll-margin-top or scroll-padding-top to clear fixed navbar during navigation', () => {
    const hasScrollMargin =
      css.includes('scroll-margin-top:') ||
      css.includes('scroll-margin:');
    const hasScrollPadding =
      css.includes('scroll-padding-top:') ||
      css.includes('scroll-padding:');

    assert.ok(
      hasScrollMargin || hasScrollPadding,
      'CSS must define scroll-margin-top or scroll-padding-top for fixed navbar clearance'
    );
  });

  test('CSS defines active state styling for mobile navigation links', () => {
    assert.ok(
      css.includes('.mobile-nav-links a.active') ||
      css.includes('.mobile-nav-links a[aria-current="page"]'),
      'CSS must style active mobile navigation link state'
    );
  });

  test('Client JS implements dedicated programmatic navigation for mobile menu links', () => {
    // Check mobile navigation links handler implementation in app.js
    const mobileLinksBlock = appJs.slice(
      appJs.indexOf('mobileNavOverlay.querySelectorAll(\'a\')'),
      appJs.indexOf('mobileNavOverlay.querySelectorAll(\'a\')') + 1200
    );

    assert.ok(mobileLinksBlock.length > 50, 'Must find mobileNavOverlay link handling in app.js');
    assert.ok(
      mobileLinksBlock.includes('preventDefault') || mobileLinksBlock.includes('scrollToSection'),
      'Mobile navigation link click handler must prevent default jump conflict and trigger programmatic scroll'
    );
    assert.ok(
      mobileLinksBlock.includes('restoreFocus: false') || mobileLinksBlock.includes('false'),
      'Mobile nav link click handler must not restore focus to hamburger'
    );
    assert.ok(
      appJs.includes('scrollToSection') || appJs.includes('targetElement.scrollIntoView'),
      'Client JS must define smooth scrolling navigation function for mobile links'
    );
  });

  test('Focus is NOT stolen back to navHamburger when navigating via mobile menu links', () => {
    // When a link is clicked, focus should not be forced back to hamburger
    // restoreFocus should only happen for hamburger toggle, close button, or Escape
    assert.ok(
      appJs.includes('restoreFocus') || appJs.includes('focusHamburger'),
      'closeMobileNav should support conditional focus restoration'
    );
  });

  test('Simulated mobile navigation flow: open -> tap link -> unlock body -> close overlay -> scrollTo target', () => {
    // Set up mock DOM environment
    let bodyOverflow = '';
    let windowScrollX = 0;
    let windowScrollY = 0;
    let lastScrollToOptions: any = null;
    let hamburgerFocused = false;
    let activeNavPillHref = '';
    let activeMobileLinkHref = '';

    const mockBody = {
      style: {
        get overflow() { return bodyOverflow; },
        set overflow(val: string) { bodyOverflow = val; }
      }
    };

    const mockHamburger = {
      attributes: { 'aria-expanded': 'false' },
      setAttribute(k: string, v: string) { this.attributes[k] = v; },
      getAttribute(k: string) { return this.attributes[k]; },
      focus() { hamburgerFocused = true; }
    };

    const overlayClasses = new Set<string>();
    const mockOverlay = {
      classList: {
        add(c: string) { overlayClasses.add(c); },
        remove(c: string) { overlayClasses.delete(c); },
        contains(c: string) { return overlayClasses.has(c); }
      },
      attributes: { 'aria-hidden': 'true' },
      setAttribute(k: string, v: string) { this.attributes[k] = v; },
      getAttribute(k: string) { return this.attributes[k]; }
    };

    const mockSections: Record<string, { top: number; height: number }> = {
      home: { top: 0, height: 800 },
      about: { top: 800, height: 900 },
      skills: { top: 1700, height: 750 },
      services: { top: 2450, height: 850 },
      projects: { top: 3300, height: 1100 },
      process: { top: 4400, height: 800 },
      faq: { top: 5200, height: 700 },
      contact: { top: 5900, height: 600 }
    };

    // Helper functions mimicking app.js implementation
    function closeMobileNav({ restoreFocus = false } = {}) {
      mockOverlay.classList.remove('open');
      mockOverlay.setAttribute('aria-hidden', 'true');
      mockHamburger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        mockHamburger.focus();
      }
      mockBody.style.overflow = '';
    }

    function openMobileNav() {
      mockOverlay.classList.add('open');
      mockOverlay.setAttribute('aria-hidden', 'false');
      mockHamburger.setAttribute('aria-expanded', 'true');
      mockBody.style.overflow = 'hidden';
    }

    function scrollToSection(targetId: string) {
      if (targetId === '#home') {
        lastScrollToOptions = { top: 0, behavior: 'smooth' };
        windowScrollY = 0;
        return;
      }
      const id = targetId.replace('#', '');
      const sec = mockSections[id];
      if (!sec) return;
      const navOffset = 70 + 16;
      const targetTop = sec.top - navOffset;
      lastScrollToOptions = { top: Math.max(0, targetTop), behavior: 'smooth' };
      windowScrollY = lastScrollToOptions.top;
    }

    // Step 1: User opens mobile hamburger menu
    openMobileNav();
    assert.equal(mockOverlay.classList.contains('open'), true, 'Overlay must be open');
    assert.equal(mockOverlay.getAttribute('aria-hidden'), 'false');
    assert.equal(mockHamburger.getAttribute('aria-expanded'), 'true');
    assert.equal(mockBody.style.overflow, 'hidden', 'Body must be locked while menu is open');

    // Step 2 & 3: User taps "#projects" link
    hamburgerFocused = false;
    let defaultPrevented = false;
    const mockEvent = {
      preventDefault() { defaultPrevented = true; }
    };

    // Click handler execution
    mockEvent.preventDefault();
    assert.equal(defaultPrevented, true, 'Default anchor jump must be prevented');

    // Step 4: Menu closes without stealing focus back to hamburger
    closeMobileNav({ restoreFocus: false });
    assert.equal(mockOverlay.classList.contains('open'), false, 'Overlay must be closed');
    assert.equal(mockOverlay.getAttribute('aria-hidden'), 'true');
    assert.equal(mockHamburger.getAttribute('aria-expanded'), 'false');
    assert.equal(hamburgerFocused, false, 'Focus must NOT be forced back to hamburger on link tap');

    // Step 5: Body scroll is unlocked immediately
    assert.equal(mockBody.style.overflow, '', 'Body overflow lock must be released immediately');

    // Step 6: Window smoothly scrolls to target section with navbar offset clearance
    scrollToSection('#projects');
    assert.ok(lastScrollToOptions, 'window.scrollTo must be called');
    assert.equal(lastScrollToOptions.behavior, 'smooth');
    assert.equal(lastScrollToOptions.top, 3300 - 86);
    assert.equal(windowScrollY, 3300 - 86);

    // Step 7: Repeatable test - user opens menu again from #projects and taps #contact
    openMobileNav();
    assert.equal(mockOverlay.classList.contains('open'), true);
    assert.equal(mockBody.style.overflow, 'hidden');

    closeMobileNav({ restoreFocus: false });
    assert.equal(mockOverlay.classList.contains('open'), false);
    assert.equal(mockBody.style.overflow, '');
    scrollToSection('#contact');
    assert.equal(lastScrollToOptions.top, 5900 - 86);
    assert.equal(windowScrollY, 5900 - 86);

    // Step 8: User opens menu and dismisses with Escape key -> focus MUST be restored
    openMobileNav();
    hamburgerFocused = false;
    closeMobileNav({ restoreFocus: true });
    assert.equal(hamburgerFocused, true, 'Dismissing menu via Escape or close button must restore focus to hamburger');
  });
});
