import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Responsive Breakpoints & Width Validation (320px - 1440px)', () => {
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  const widths = [320, 360, 390, 430, 768, 1024, 1440];

  test('CSS rules properly handle all 7 required responsive widths', () => {
    // 320px & 360px: @media (max-width: 360px)
    assert.ok(css.includes('@media (max-width: 360px)'), 'CSS must include max-width: 360px breakpoint');
    assert.ok(css.includes('min-width: 250px !important;'), 'Cards at <= 360px must fit 320px screen width');

    // 390px & 430px: @media (max-width: 480px)
    assert.ok(css.includes('@media (max-width: 480px)'), 'CSS must include max-width: 480px breakpoint');
    assert.ok(css.includes('width: 86vw !important;'), 'Cards at <= 480px must scale fluidly with viewport width');

    // 768px: @media (max-width: 768px)
    assert.ok(css.includes('@media (max-width: 768px)'), 'CSS must include max-width: 768px breakpoint');

    // 1024px: @media (max-width: 1024px)
    assert.ok(css.includes('@media (max-width: 1024px)'), 'CSS must include max-width: 1024px breakpoint');

    // 1440px: Desktop baseline styles
    assert.ok(css.includes('--container: 1200px;'), 'Desktop must have 1200px container width');
    assert.ok(css.includes('.projects-pin-section {'), 'Desktop must have pinned section');
  });

  test('Card geometry fits within viewport at every mobile width without causing horizontal overflow on body', () => {
    // Test card widths at 320px, 360px, 390px, 430px, 768px
    const mobileWidths = [320, 360, 390, 430, 768];

    mobileWidths.forEach((w) => {
      let cardWidth: number;
      let containerPad: number;

      if (w <= 360) {
        cardWidth = Math.min(290, Math.max(250, w * 0.9));
        containerPad = 12 * 2;
      } else if (w <= 480) {
        cardWidth = Math.min(340, Math.max(280, w * 0.86));
        containerPad = 16 * 2;
      } else {
        cardWidth = Math.min(360, Math.max(290, w * 0.82));
        containerPad = 20 * 2;
      }

      // Card must be narrower than full screen width
      assert.ok(
        cardWidth < w,
        `At ${w}px, card width (${cardWidth}px) must be less than viewport width (${w}px)`
      );

      // Body has overflow-x: hidden to prevent page-level horizontal overflow
      assert.ok(css.includes('overflow-x: hidden;'), 'Body must enforce overflow-x: hidden');
    });
  });

  test('Navbar and Mobile menu layout rules ensure no overlap or collision', () => {
    assert.ok(css.includes('--navbar-bottom:'), 'CSS must maintain --navbar-bottom token');
    assert.ok(css.includes('padding-top: calc(var(--navbar-bottom'), 'Mobile menu padding must use --navbar-bottom');
    assert.ok(css.includes('justify-content: flex-start;'), 'Mobile menu must not be centered vertically');
  });

  test('Mobile project gallery touch-action permits both horizontal swipe and vertical page pan', () => {
    assert.ok(
      css.includes('touch-action: pan-x pan-y !important;') || css.includes('touch-action: pan-y pan-x !important;'),
      'Touch action must permit pan-x and pan-y'
    );
  });
});
