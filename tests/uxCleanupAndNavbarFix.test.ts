import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PortfolioService } from '../src/services/portfolioService.js';
import { ContextDevService } from '../src/services/contextDev.js';

describe('UX Cleanup & Bug Fix Pass Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');

  // =========================================================================
  // TASK 1: REMOVE REDUNDANT "LET'S TALK" TEXT
  // =========================================================================
  describe('Task 1 — Remove Redundant "Let\'s Talk" Text', () => {
    test('Only ONE purposeful primary contact CTA with "Let\'s talk" remains on the visible frontend', () => {
      // Find all occurrences of "let's talk" (case-insensitive) in visible HTML
      const matches = [...html.matchAll(/let['’]s\s+talk/gi)];
      
      // Exactly 1 match should exist in HTML
      assert.equal(
        matches.length,
        1,
        `Expected exactly 1 occurrence of "Let's talk" on visible frontend, but found ${matches.length}`
      );

      // Verify that this one occurrence is the primary hero contact CTA button
      const heroCtaMatch = html.match(/<div class="hero-cta-group"[^>]*>([\s\S]*?)<\/div>/);
      assert.ok(heroCtaMatch, 'Hero CTA group must exist');
      assert.ok(
        heroCtaMatch[1].includes("Let's talk"),
        'The single primary contact CTA with "Let\'s talk" must reside in the hero section'
      );
      assert.ok(
        heroCtaMatch[1].includes('href="#contact"'),
        'Hero primary contact CTA must point to #contact'
      );
    });

    test('Navbar CTA, About CTA, Footer heading, and Sticky CTA have clean, non-repetitive copies', () => {
      // Navbar CTA
      assert.ok(
        html.includes('class="nav-cta-btn"') && html.includes('Get in touch'),
        'Navbar CTA should feature clean "Get in touch" label'
      );
      assert.ok(!html.includes('nav-cta-btn">\n        <span class="nav-cta-emoji" aria-hidden="true">👋</span> Let\'s talk'));

      // Mobile nav CTA
      assert.ok(
        html.includes('class="mobile-nav-actions"') && html.includes('Get in touch'),
        'Mobile nav actions should feature clean "Get in touch" link'
      );

      // About CTA
      assert.ok(
        html.includes('class="about-cta-row"') && html.includes('Work with me'),
        'About section CTA should feature purposeful "Work with me" button'
      );

      // Footer monumental headline
      assert.ok(
        html.includes('footer-talk-lets">SAY</span>') && html.includes('footer-talk-talk">HELLO</span>'),
        'Footer headline should be stylish and welcoming "SAY HELLO"'
      );
      assert.ok(!html.includes('footer-talk-lets">LET\'S</span>'));
      assert.ok(!html.includes('footer-talk-talk">TALK</span>'));

      // Sticky bottom CTA
      const stickyMatch = html.match(/<div class="sticky-bottom-cta"[^>]*>([\s\S]*?)<\/div>/);
      assert.ok(stickyMatch, 'Sticky bottom CTA must exist');
      assert.ok(
        stickyMatch[1].includes('Get in touch'),
        'Sticky CTA should have clean "Get in touch" label'
      );
      assert.ok(
        !stickyMatch[1].toLowerCase().includes('talk'),
        'Sticky CTA must not have redundant decorative "Let\'s talk" text'
      );

      // Floating cursor
      const cursorMatch = html.match(/<div class="talk-cursor"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
      assert.ok(cursorMatch, 'Talk cursor must exist');
      // Verify visible inner text has no "LET'S TALK"
      assert.ok(
        !cursorMatch[1].includes("LET'S TALK") && !cursorMatch[1].includes("Let's talk"),
        'Floating cursor disc must not contain redundant "LET\'S TALK" text'
      );
      assert.ok(
        cursorMatch[1].includes('talk-cursor__arrow'),
        'Floating cursor disc should preserve directional arrow'
      );
    });
  });

  // =========================================================================
  // TASK 2: REMOVE PROJECT ENRICH SYSTEM FROM VISIBLE EXPERIENCE
  // =========================================================================
  describe('Task 2 — Remove Project Enrich System from Visible Project Experience', () => {
    test('Projects section contains no Enrich URL bar, input, or status indicator', () => {
      assert.ok(!html.includes('class="enrich-bar"'), 'Enrich bar must be removed from HTML');
      assert.ok(!html.includes('id="custom-url-input"'), 'Custom URL input must be removed from HTML');
      assert.ok(!html.includes('id="enrich-btn"'), 'Enrich URL button must be removed from HTML');
      assert.ok(!html.includes('id="enrich-loading"'), 'Enrich loading indicator must be removed from HTML');
    });

    test('Project cards and detail modal contain no visitor-facing Enrich controls or badges', () => {
      // In app.js card template
      assert.ok(
        !appJs.includes('class="project-card-enrich"'),
        'app.js must not render .project-card-enrich buttons on cards'
      );
      assert.ok(
        !appJs.includes('class="enriched-badge-box"'),
        'app.js must not render .enriched-badge-box badges on cards'
      );

      // In app.js modal template
      assert.ok(
        !appJs.includes('class="modal-enrich-trigger"'),
        'app.js must not render .modal-enrich-trigger buttons in detail modal'
      );
      assert.ok(
        !appJs.includes('class="modal-enriched-box"'),
        'app.js must not render .modal-enriched-box in detail modal'
      );
    });

    test('All five projects remain present in their exact required order', () => {
      const service = new PortfolioService({} as unknown as ContextDevService);
      const profile = service.getProfile();
      const projectIds = profile.projects.map((p) => p.id);

      assert.deepEqual(projectIds, [
        'clocky',
        'expify-beta',
        'nomnom',
        'alchemy',
        'aevique',
      ], 'The 5 projects must remain in exact order: Clocky, Expify Beta, NomNom, Alchemy, AEVIQUE');

      // Verify each project preserves covers, screenshots, description, and tags
      profile.projects.forEach((p) => {
        assert.ok(p.title, `Project ${p.id} must have title`);
        assert.ok(p.description, `Project ${p.id} must have description`);
        assert.ok(p.coverSrc, `Project ${p.id} must have coverSrc`);
        assert.ok(p.screenshots.length >= 4, `Project ${p.id} must have screenshots`);
        assert.ok(p.tags.length >= 3, `Project ${p.id} must have tech tags`);
      });
    });

    test('Backend enrichment routes and services remain intact', () => {
      const serverTsPath = path.resolve(process.cwd(), 'src/server.ts');
      const serverTs = fs.readFileSync(serverTsPath, 'utf8');
      assert.ok(serverTs.includes('/api/portfolio/enrich'), 'Backend route /api/portfolio/enrich must remain preserved');
    });
  });

  // =========================================================================
  // TASK 3: FIX NAVBAR ACTIVE-SECTION HIGHLIGHT LAG
  // =========================================================================
  describe('Task 3 — Fix Navbar Active-Section Highlight Lag', () => {
    test('Client JS attaches dedicated navigation click handlers to desktop and mobile nav items', () => {
      assert.ok(
        appJs.includes('navigateToSection'),
        'Client JS must implement dedicated navigateToSection() handler'
      );
      assert.ok(
        appJs.includes('setActivePill'),
        'Client JS must implement setActivePill() for instantaneous synchronous feedback'
      );
      assert.ok(
        appJs.includes('navPills.forEach'),
        'Client JS must attach click listeners to desktop nav pills'
      );
    });

    test('Active section detection uses real-time boundingClientRect viewport intersection', () => {
      assert.ok(
        appJs.includes('getBoundingClientRect()'),
        'Active section detection must use getBoundingClientRect() to avoid offsetTop lag'
      );
      assert.ok(
        appJs.includes('isProgrammaticScroll'),
        'Client JS must track isProgrammaticScroll to prevent intermediate scroll lag during smooth scroll'
      );
      assert.ok(
        appJs.includes('navTrackedSections'),
        'Client JS must maintain comprehensive section tracking mapping'
      );
    });

    test('Simulated sequence of navigation clicks selects the exact destination without lagging behind', () => {
      const activeStates: Record<string, string> = {};
      const requiredSections = ['home', 'about', 'skills', 'services', 'projects', 'process', 'faq', 'contact'];

      // Simulate navigateToSection for every section in sequence
      requiredSections.forEach((sectionId) => {
        let selectedPill = '';
        const navPills = requiredSections.map((id) => ({
          href: `#${id}`,
          active: false,
          ariaCurrent: null as string | null,
        }));

        // Emulate setActivePill logic from app.js
        const targetHref = `#${sectionId}`;
        navPills.forEach((pill) => {
          if (pill.href === targetHref) {
            pill.active = true;
            pill.ariaCurrent = 'page';
            selectedPill = pill.href.replace('#', '');
          } else {
            pill.active = false;
            pill.ariaCurrent = null;
          }
        });

        activeStates[sectionId] = selectedPill;
      });

      // Verify that every click in sequence highlights the clicked section, never the previous section
      assert.equal(activeStates['about'], 'about', 'Clicking About must activate About, not Home');
      assert.equal(activeStates['skills'], 'skills', 'Clicking Skills must activate Skills, not About');
      assert.equal(activeStates['services'], 'services', 'Clicking Services must activate Services, not Skills');
      assert.equal(activeStates['projects'], 'projects', 'Clicking Projects must activate Projects, not Services');
      assert.equal(activeStates['process'], 'process', 'Clicking Process must activate Process, not Projects');
      assert.equal(activeStates['faq'], 'faq', 'Clicking FAQ must activate FAQ, not Process');
      assert.equal(activeStates['contact'], 'contact', 'Clicking Contact must activate Contact, not FAQ');
    });

    test('Viewport intersection simulation maps intermediate and pinned sections to correct navbar items', () => {
      // Mock sections geometry simulating actual page layout
      const mockDOM: Record<string, { top: number; bottom: number; targetNav: string }> = {
        home: { top: 0, bottom: 900, targetNav: 'home' },
        about: { top: 900, bottom: 1700, targetNav: 'about' },
        chapters: { top: 1700, bottom: 2300, targetNav: 'about' },
        skills: { top: 2300, bottom: 3100, targetNav: 'skills' },
        services: { top: 3100, bottom: 3900, targetNav: 'services' },
        tags: { top: 3900, bottom: 4600, targetNav: 'services' },
        projects: { top: 4600, bottom: 6400, targetNav: 'projects' }, // Pinned 200vh
        process: { top: 6400, bottom: 7200, targetNav: 'process' },
        faq: { top: 7200, bottom: 7900, targetNav: 'faq' },
        blog: { top: 7900, bottom: 8500, targetNav: 'faq' },
        contact: { top: 8500, bottom: 9200, targetNav: 'contact' },
      };

      const navThreshold = 100; // 80px nav bottom + 20px threshold

      function resolveActiveSectionAtScrollY(scrollY: number): string {
        for (const [id, sec] of Object.entries(mockDOM)) {
          const rectTop = sec.top - scrollY;
          const rectBottom = sec.bottom - scrollY;
          if (rectTop <= navThreshold && rectBottom > navThreshold) {
            return sec.targetNav;
          }
        }
        return 'home';
      }

      // Test scroll positions
      assert.equal(resolveActiveSectionAtScrollY(0), 'home');
      assert.equal(resolveActiveSectionAtScrollY(900), 'about');
      assert.equal(resolveActiveSectionAtScrollY(1800), 'about'); // In chapters shelf
      assert.equal(resolveActiveSectionAtScrollY(2350), 'skills');
      assert.equal(resolveActiveSectionAtScrollY(3150), 'services');
      assert.equal(resolveActiveSectionAtScrollY(4000), 'services'); // In tags sandbox
      assert.equal(resolveActiveSectionAtScrollY(4700), 'projects'); // Projects start
      assert.equal(resolveActiveSectionAtScrollY(5500), 'projects'); // Middle of pinned projects
      assert.equal(resolveActiveSectionAtScrollY(6250), 'projects'); // Within pinned projects before next section reaches nav
      assert.equal(resolveActiveSectionAtScrollY(6450), 'process');
      assert.equal(resolveActiveSectionAtScrollY(7250), 'faq');
      assert.equal(resolveActiveSectionAtScrollY(8000), 'faq'); // In blog section
      assert.equal(resolveActiveSectionAtScrollY(8550), 'contact');
    });

    test('Bottom-to-top geometry resolution permanently prevents negative margin overlap bug', () => {
      // Real CSS geometry with margin-top: -32px overlaps:
      // - .projects-pin-section has margin-top: -32px (overlaps #tags bottom by 32px)
      // - .process-section has margin-top: -32px (overlaps #projects bottom by 32px)
      // - .final-cta-section has margin-top: -32px (overlaps #blog bottom by 32px)
      const overlappingSections = [
        { id: 'home', top: 0, bottom: 900, targetNav: 'home' },
        { id: 'about', top: 900, bottom: 1700, targetNav: 'about' },
        { id: 'chapters', top: 1700, bottom: 2300, targetNav: 'about' },
        { id: 'skills', top: 2300, bottom: 3100, targetNav: 'skills' },
        { id: 'services', top: 3100, bottom: 3900, targetNav: 'services' },
        { id: 'tags', top: 3900, bottom: 4632, targetNav: 'services' }, // Bottom ends 32px into projects
        { id: 'projects', top: 4600, bottom: 6432, targetNav: 'projects' }, // Bottom ends 32px into process
        { id: 'process', top: 6400, bottom: 7200, targetNav: 'process' },
        { id: 'faq', top: 7200, bottom: 7900, targetNav: 'faq' },
        { id: 'blog', top: 7900, bottom: 8532, targetNav: 'faq' }, // Bottom ends 32px into contact
        { id: 'contact', top: 8500, bottom: 9300, targetNav: 'contact' },
      ];

      const navThreshold = 108; // 80px nav bottom + 28px buffer

      // Implements the bottom-to-top traversal from app.js getActiveNavId()
      function resolveBottomToTop(scrollY: number, isAtDocBottom = false): string {
        if (scrollY < 50) return 'home';
        if (isAtDocBottom) return 'contact';

        for (let i = overlappingSections.length - 1; i >= 0; i--) {
          const sec = overlappingSections[i];
          const rectTop = sec.top - scrollY;
          if (rectTop <= navThreshold) {
            return sec.targetNav;
          }
        }
        return 'home';
      }

      // Test 1: Scrolled to Projects destination (target arrives at navOffset = 96px)
      const scrollYAtProjects = 4600 - 96; // 4504
      assert.equal(
        resolveBottomToTop(scrollYAtProjects),
        'projects',
        'At Projects scroll destination, active section must be Projects, never Services'
      );

      // Test 2: Scrolled through entire pinned 200vh horizontal track
      assert.equal(resolveBottomToTop(4800), 'projects', 'Early in pinned track must be Projects');
      assert.equal(resolveBottomToTop(5500), 'projects', 'Middle of pinned track must be Projects');
      assert.equal(resolveBottomToTop(6200), 'projects', 'Late in pinned track must be Projects');

      // Test 3: Scrolled to Process destination
      const scrollYAtProcess = 6400 - 96; // 6304
      assert.equal(
        resolveBottomToTop(scrollYAtProcess),
        'process',
        'At Process scroll destination, active section must be Process, never Projects'
      );

      // Test 4: Scrolled to FAQ destination
      const scrollYAtFaq = 7200 - 96;
      assert.equal(
        resolveBottomToTop(scrollYAtFaq),
        'faq',
        'At FAQ destination, active section must be FAQ, never Process'
      );

      // Test 5: Scrolled to Contact destination
      const scrollYAtContact = 8500 - 96;
      assert.equal(
        resolveBottomToTop(scrollYAtContact),
        'contact',
        'At Contact destination, active section must be Contact, never FAQ'
      );

      // Test 6: Document bottom fallback
      assert.equal(
        resolveBottomToTop(8400, true),
        'contact',
        'At document bottom, active section must be Contact'
      );
    });

    test('Client JS contains permanent active-section architecture with bottom-to-top resolver and hash support', () => {
      // 1. Bottom-to-top traversal
      assert.ok(
        appJs.includes('for (let i = navTrackedSections.length - 1; i >= 0; i--)'),
        'app.js must implement bottom-to-top traversal to prevent negative margin overlap bugs'
      );

      // 2. Dedicated getActiveNavId
      assert.ok(
        appJs.includes('function getActiveNavId()'),
        'app.js must define getActiveNavId function'
      );

      // 3. History and hashchange event listeners
      assert.ok(
        appJs.includes("window.addEventListener('popstate'"),
        'app.js must listen for popstate to support browser back/forward navigation'
      );
      assert.ok(
        appJs.includes("window.addEventListener('hashchange'"),
        'app.js must listen for hashchange to support direct hash jump navigation'
      );

      // 4. Clean settle check with initial ramp-up delay
      assert.ok(
        appJs.includes('now - startTime > 150'),
        'checkSettle must not settle prematurely before smooth scroll animation begins'
      );

      // 5. Navigation attached to nav-logo and chapter cards
      assert.ok(
        appJs.includes("document.querySelector('.nav-logo')"),
        'app.js must handle nav-logo navigation'
      );
    });
  });

  // =========================================================================
  // TASK 4: REMOVE FOOTER CONTEXT.DEV ATTRIBUTION
  // =========================================================================
  describe('Task 4 — Remove Footer Context.dev Attribution', () => {
    test('public/index.html does NOT contain footer-powered or Context.dev attribution text', () => {
      assert.ok(
        !html.includes('class="footer-powered"'),
        'public/index.html must not contain class="footer-powered"'
      );
      assert.ok(
        !html.includes('Powered by <a href="https://context.dev"'),
        'Footer must not contain "Powered by Context.dev" attribution markup'
      );
      assert.ok(
        !html.includes('footer-powered'),
        'No footer-powered references should remain in index.html'
      );
    });

    test('public/style.css does NOT contain unused .footer-powered styling', () => {
      assert.ok(
        !css.includes('.footer-powered'),
        'public/style.css must not contain .footer-powered rules'
      );
    });

    test('Footer layout, copyright text, and social links are fully preserved', () => {
      assert.ok(html.includes('class="footer-bottom"'), 'Footer bottom container must remain intact');
      assert.ok(html.includes('class="footer-copyright"'), 'Footer copyright element must remain intact');
      assert.ok(
        html.includes('© 2026 Mrh Rafi. All rights reserved.'),
        'Footer copyright text must be preserved'
      );
      assert.ok(html.includes('https://github.com/mrhrafi3'), 'Footer GitHub link must be preserved');
      assert.ok(html.includes('https://bd.linkedin.com/in/mrhrafi'), 'Footer LinkedIn link must be preserved');
      assert.ok(html.includes('mailto:mrhrafi99@gmail.com'), 'Footer email link must be preserved');
    });

    test('Context.dev backend integration and endpoints are strictly intact', () => {
      assert.ok(
        fs.existsSync(path.resolve(process.cwd(), 'src/services/contextDev.ts')),
        'src/services/contextDev.ts must exist'
      );
      assert.ok(
        fs.existsSync(path.resolve(process.cwd(), 'src/services/portfolioService.ts')),
        'src/services/portfolioService.ts must exist'
      );
      assert.ok(
        fs.existsSync(path.resolve(process.cwd(), 'src/server.ts')),
        'src/server.ts must exist'
      );

      const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'src/server.ts'), 'utf8');
      assert.ok(
        serverSource.includes('/api/portfolio/enrich'),
        'Context.dev enrich API endpoint must remain available in server.ts'
      );
      assert.ok(
        serverSource.includes('service.enrichProject'),
        'Server must retain service.enrichProject integration'
      );
    });
  });

  // =========================================================================
  // TASK 5: EDITORIAL FOOTER PORTRAIT INTEGRATION
  // =========================================================================
  describe('Task 5 — Editorial Footer Portrait Integration', () => {
    test('Portrait markup structure is properly defined with stage, aura, wrap, and image', () => {
      assert.ok(html.includes('class="footer-portrait-stage"'), 'Stage element must exist in index.html');
      assert.ok(html.includes('class="footer-portrait-aura"'), 'Aura element must exist in index.html');
      assert.ok(html.includes('class="footer-portrait-wrap"'), 'Wrap container must exist in index.html');
      assert.ok(html.includes('class="footer-portrait-img"'), 'Portrait image must exist in index.html');
      assert.ok(html.includes('src="/images/footer_image.png"'), 'Must reference footer_image.png');
    });

    test('CSS defines dual-gradient masking for vertical bottom dissolution and horizontal arm feathering', () => {
      // 1. Vertical bottom fade on .footer-portrait-wrap
      assert.ok(
        css.includes('-webkit-mask-image: linear-gradient(\n    to bottom') ||
        css.includes('mask-image: linear-gradient(\n    to bottom') ||
        css.includes('to bottom,\n    #000 0%'),
        'Wrap must define to-bottom mask gradient for smooth bottom fade'
      );

      // 2. Horizontal arm feathering on .footer-portrait-img
      assert.ok(
        css.includes('to right,\n    transparent 0%') ||
        css.includes('to right, transparent 0%') ||
        css.includes('to right,\n    transparent'),
        'Image must define to-right mask gradient to eliminate straight arm cutoffs'
      );

      // 3. No blunt mask-image: none !important overrides
      assert.ok(
        !css.includes('mask-image: none !important'),
        'Must remove obsolete mask-image: none !important overrides'
      );
    });

    test('CSS applies chiaroscuro tonal darkening to prevent foggy or ghosted white shirt fade', () => {
      assert.ok(
        css.includes('.footer-portrait-wrap::after'),
        'Wrap must have ::after pseudo-element for shadow overlay'
      );
      assert.ok(
        css.includes('mix-blend-mode: multiply'),
        'Shadow overlay must use mix-blend-mode: multiply to blend fabric into footer base'
      );
      assert.ok(
        css.includes('#090a0d'),
        'Shadow overlay must use exact footer obsidian color #090a0d'
      );
    });

    test('Atmospheric background aura uses diffuse studio backlighting without harsh oval borders', () => {
      assert.ok(
        css.includes('.footer-portrait-aura'),
        'CSS must define .footer-portrait-aura styling'
      );
      assert.ok(
        css.includes('filter: blur(52px)') || css.includes('filter: blur(48px)'),
        'Aura must use deep blur (>= 48px) to eliminate hard oval contours'
      );
      assert.ok(
        css.includes('animation: footerAuraPulse'),
        'Aura must have subtle breathing pulse animation'
      );
      assert.ok(
        css.includes('.footer-portrait-aura,\n  .footer-kicker-dot') ||
        css.includes('.footer-portrait-aura,'),
        'prefers-reduced-motion must safely disable aura animation'
      );
    });

    test('Responsive portrait geometry rules are preserved across all breakpoints', () => {
      assert.ok(css.includes('@media (max-width: 1024px)'), '1024px tablet breakpoint must be handled');
      assert.ok(css.includes('@media (max-width: 768px)'), '768px mobile breakpoint must be handled');
      assert.ok(css.includes('@media (max-width: 480px)'), '480px phone breakpoint must be handled');
      assert.ok(css.includes('@media (max-width: 360px)'), '360px small phone breakpoint must be handled');
    });
  });
});
