# Rafi Portfolio 10/10 Premium Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `rafi_portfolio` into an award-winning, responsive, accessible, high-performance developer portfolio with cohesive visual art-direction, silky-smooth motion, and bulletproof multi-device ergonomics.

**Architecture:** Vanilla HTML5, CSS3 (custom properties, fluid clamp typography, 3D transforms, container queries), and vanilla TypeScript/ES module JavaScript (with Matter.js 2D physics engine for skills sandbox and Express/Context.dev backend). All enhancements build directly on the existing architecture without unnecessary external libraries.

**Tech Stack:** Express, TypeScript, Context.dev API, Matter.js, Google Fonts (Bebas Neue, Instrument Serif, Plus Jakarta Sans, JetBrains Mono, Caveat), Node.js test runner.

**Spec:** Direct user mission in `<USER_REQUEST>` covering 5 controlled phases:
1. Critical fixes (CSS syntax errors, split-text headline bug, mobile portrait visibility, gallery scroll sync).
2. Visual design system refinement (typography hierarchy, surface treatments, color contrast, micro-details).
3. Motion design & interaction upgrades (hero entrance choreography, silky-smooth section transitions, card 3D tilt, magnetic talk cursor, modal transitions).
4. Responsive & accessibility polish (320px–1920px+ viewports, mobile touch interactions, focus traps, ARIA attributes, WCAG AA contrast, reduced-motion).
5. Performance, SEO, and final verification (zero console errors, passive listeners, responsive image delivery, meta tags, test suite passing).

## Global Constraints
- Preserve all existing project content, verified facts, assets, and routes (Clocky, Expify Beta, NomNom, Alchemy, AEVIQUE).
- Never break or remove existing test assertions (all 40 tests in `tests/*.test.ts` must pass).
- Strictly adhere to Context.dev integration standards (no secrets exposed, server-side wrapper used).
- Support `prefers-reduced-motion` across all animations and physics simulation.
- Never add unnecessary external dependencies.

## Review Focus
1. `initSplitText` destroying `<br />` and `<span class="hero-headline-accent">` in headlines: Must parse text while preserving line breaks and nested styled spans.
2. Mobile portrait completely hidden on screens ≤ 1024px: Must provide an art-directed responsive mobile portrait layout that keeps the personal connection intact.
3. CSS syntax error at lines 1230-1240 in `public/style.css` (orphan block and duplicate definitions): Must be cleaned up and properly formatted.
4. Mobile swipe in projects gallery: Must keep the step counter (`01 / 05`) and arrow buttons reactive and synchronized as user swipes on touch devices.
5. Project modal focus management: Must trap focus within the modal, prevent body scroll, and return focus to the trigger on close.

---

### Task 1: Phase 1 — Critical Fixes & Syntax Repair
**Files:**
- Modify: `public/style.css:1215-1280` (fix CSS syntax error, eliminate duplicate progress bar and orphan rules)
- Modify: `public/app.js:1020-1040` (fix `initSplitText` to respect `<br>` and child spans)
- Modify: `public/style.css:2245-2310` (un-hide and refine hero portrait on mobile/tablet viewports)
- Modify: `public/app.js:500-650` (mobile scroll synchronization for projects counter & arrows)

- [ ] **Step 1: Fix broken CSS syntax and duplicate progress track rules in `public/style.css`**
- [ ] **Step 2: Rewrite `initSplitText` in `public/app.js` to preserve line breaks and accent spans without flattening HTML**
- [ ] **Step 3: Responsive portrait display on tablet and mobile viewports in `public/style.css`**
- [ ] **Step 4: Add mobile scroll/swipe sync for horizontal project carousel in `public/app.js`**
- [ ] **Step 5: Run tests and verify syntax and builds (`npm test && npm run build`)**

---

### Task 2: Phase 2 — Distinctive Visual Design System Refinement
**Files:**
- Modify: `public/style.css` (typography scale, line-height, letter-spacing, surface depth, contrast fixes)
- Modify: `public/index.html` (semantic enhancements, ARIA roles, high-contrast navbar logo accent for light theme)
- Modify: `public/style.css` (refine cards, badges, service cards, stat cards, and quote/testimonial blocks)

- [ ] **Step 1: Refine typography hierarchy and fluid spacing using CSS clamp and micro-tracking**
- [ ] **Step 2: Fix color contrast issue on light navbar where yellow accent was unreadable against white**
- [ ] **Step 3: Elevate surface treatments: subtle grid lines, specular highlights, card borders, and hover micro-interactions**
- [ ] **Step 4: Polish project cards presentation with refined typography, tags, badges, and button aesthetics**
- [ ] **Step 5: Run tests (`npm test`) to ensure no visual classes expected by tests are altered**

---

### Task 3: Phase 3 — Motion Design & Interaction Upgrades
**Files:**
- Modify: `public/app.js` (choreographed hero entrance, magnetic talk cursor smoothing, card 3D tilt refinement)
- Modify: `public/style.css` (refined transitions, keyframes, button hover states, modal spring entrance)

- [ ] **Step 1: Choreograph hero entrance animation with staggered CSS transitions and natural easing**
- [ ] **Step 2: Refine magnetic talk cursor with smooth lerp physics and boundary fade-out**
- [ ] **Step 3: Upgrade project card 3D perspective tilt with natural damping and zero-jitter child button handling**
- [ ] **Step 4: Enhance modal opening, closing, and screenshot switching transitions**
- [ ] **Step 5: Ensure all animations gracefully deactivate when `prefers-reduced-motion` is active**
- [ ] **Step 6: Run tests (`npm test`)**

---

### Task 4: Phase 4 — Responsive & Accessibility Polish
**Files:**
- Modify: `public/index.html` (enhanced ARIA attributes, skip link, focus targets)
- Modify: `public/style.css` (focus rings, fluid typography across 320px, 375px, 430px, 768px, 1024px, 1440px, 1920px+)
- Modify: `public/app.js` (accessible modal focus trap, keyboard navigation, hamburger menu escape key handling)

- [ ] **Step 1: Add a visible "Skip to main content" link and robust `:focus-visible` styling**
- [ ] **Step 2: Implement modal focus trapping and keyboard Escape listener with focus restoration**
- [ ] **Step 3: Refine mobile navigation overlay with focus management and backdrop blur**
- [ ] **Step 4: Test and tune responsive layouts for 320px–375px (small phone), 390px–430px (iPhone), 768px–1024px (iPad/tablet), and 1440px+ (desktop)**
- [ ] **Step 5: Run tests (`npm test`)**

---

### Task 5: Phase 5 — Performance Optimization, SEO, & Final Verification
**Files:**
- Modify: `public/index.html` (rich OpenGraph, Twitter cards, theme-color, preload fonts)
- Modify: `public/app.js` (passive listeners, event cleanup, smooth RAF loops)
- Create verification test script: `tests/responsivenessAndA11y.test.ts` to programmatically test responsive CSS and a11y criteria

- [ ] **Step 1: Enhance SEO and social sharing meta tags, theme color, and font preloading in `public/index.html`**
- [ ] **Step 2: Optimize scroll listeners and RAF loops for silky 60fps performance without unnecessary layout thrashing**
- [ ] **Step 3: Create automated verification tests in `tests/responsivenessAndA11y.test.ts` for responsiveness rules and accessibility standards**
- [ ] **Step 4: Run the full test suite (`npm test`) and production build (`npm run build`)**
- [ ] **Step 5: Complete comprehensive audit and final deliverable report**
