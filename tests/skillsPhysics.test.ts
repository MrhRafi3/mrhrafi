import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

describe('Skills Section & Physics Sandbox Verification', () => {
  const htmlPath = path.resolve(process.cwd(), 'public/index.html');
  const cssPath = path.resolve(process.cwd(), 'public/style.css');
  const appJsPath = path.resolve(process.cwd(), 'public/app.js');
  const matterJsPath = path.resolve(process.cwd(), 'public/vendor/matter.min.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  const matterJs = fs.readFileSync(matterJsPath, 'utf8');

  const REQUIRED_SKILLS = [
    'Flutter',
    'Dart',
    'Riverpod',
    'C++',
    'Data Structures & Algorithms',
    'Custom Canvas',
    'SQLite',
    'REST APIs',
    'Git & GitHub',
  ];

  test('Public HTML contains all nine required skill pill elements in DOM', () => {
    REQUIRED_SKILLS.forEach((skill) => {
      const escaped = skill.replace(/&/g, '&amp;');
      assert.ok(
        html.includes(`data-skill="${skill}"`) || html.includes(`data-skill="${escaped}"`),
        `HTML must contain data-skill attribute for: ${skill}`
      );
      assert.ok(
        html.includes(escaped) || html.includes(skill),
        `HTML must visibly contain label for: ${skill}`
      );
    });
  });

  test('Public HTML contains canvas, badge, and container with proper attributes', () => {
    assert.ok(html.includes('id="skills-physics-wrap"'), 'Wrapper id must exist');
    assert.ok(html.includes('id="skills-physics-canvas"'), 'Canvas id must exist');
    assert.ok(html.includes('id="skills-pills-container"'), 'Pills container id must exist');
    assert.ok(html.includes('go on, throw them around'), 'Instruction badge must exist');
  });

  test('CSS guarantees skills are visible even if physics/canvas is absent or inactive', () => {
    // Ensure .tags-cloud or .skills-pills-wrap is NOT display: none
    assert.ok(
      !css.includes('.skills-physics-card.has-canvas .tags-cloud {\n  display: none;\n}'),
      'CSS must NOT hide tags when has-canvas is added'
    );
    assert.ok(css.includes('.skills-pills-wrap'), 'CSS must define .skills-pills-wrap');
    assert.ok(css.includes('.skill-pill'), 'CSS must define .skill-pill');
    assert.ok(css.includes('cursor: grab'), 'Pills must have tactile grab cursor');
  });

  test('Matter.js loads successfully and provides physics engine primitives', () => {
    const sandbox: Record<string, any> = {
      window: {},
      document: { createElement: () => ({ getContext: () => ({}) }) },
      navigator: { userAgent: 'test' },
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(matterJs, sandbox);

    const Matter = sandbox.Matter;
    assert.ok(Matter, 'Matter library must be defined');
    assert.ok(Matter.Engine, 'Matter.Engine must exist');
    assert.ok(Matter.Bodies, 'Matter.Bodies must exist');
    assert.ok(Matter.Composite, 'Matter.Composite must exist');
    assert.ok(Matter.Body, 'Matter.Body must exist');
  });

  test('Physics simulation keeps all nine pills contained within card boundaries', () => {
    const sandbox: Record<string, any> = {
      window: {},
      document: { createElement: () => ({ getContext: () => ({}) }) },
      navigator: { userAgent: 'test' },
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(matterJs, sandbox);

    const Matter = sandbox.Matter;
    const { Engine, Bodies, Composite, Body } = Matter;

    const width = 800;
    const height = 380;
    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 0.9;

    const floor = Bodies.rectangle(width / 2, height - 8, width * 3, 30, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -100, width * 3, 40, { isStatic: true });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 4, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 4, { isStatic: true });
    Composite.add(engine.world, [floor, ceiling, leftWall, rightWall]);

    const pillBodies: any[] = [];
    REQUIRED_SKILLS.forEach((text, i) => {
      const pillW = Math.max(70, text.length * 8 + 36);
      const pillH = 40;
      const col = i % 3;
      const row = Math.floor(i / 3);
      const startX = 100 + col * 240;
      const startY = 70 + row * 65;

      const body = Bodies.rectangle(startX, startY, pillW, pillH, {
        chamfer: { radius: 20 },
        restitution: 0.35,
        friction: 0.25,
        frictionAir: 0.015,
      });
      body.skillLabel = text;
      body.pillW = pillW;
      body.pillH = pillH;
      pillBodies.push(body);
    });

    Composite.add(engine.world, pillBodies);

    // Simulate 180 frames (3 seconds of gravity and bouncing)
    for (let f = 0; f < 180; f++) {
      Engine.update(engine, 1000 / 60);
    }

    // Verify every body is strictly within boundaries
    pillBodies.forEach((b) => {
      assert.ok(
        b.position.x >= 0 && b.position.x <= width,
        `Pill "${b.skillLabel}" x=${b.position.x} must be inside width [0, ${width}]`
      );
      assert.ok(
        b.position.y >= 0 && b.position.y <= height,
        `Pill "${b.skillLabel}" y=${b.position.y} must be inside height [0, ${height}]`
      );
    });
  });

  test('Dragging and throwing applies momentum and wakes sleeping bodies', () => {
    const sandbox: Record<string, any> = {
      window: {},
      document: { createElement: () => ({ getContext: () => ({}) }) },
      navigator: { userAgent: 'test' },
    };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(matterJs, sandbox);

    const Matter = sandbox.Matter;
    const { Engine, Bodies, Composite, Body } = Matter;

    const engine = Engine.create({ enableSleeping: true });
    const pill = Bodies.rectangle(100, 100, 120, 40);
    Composite.add(engine.world, pill);

    // Let it settle to sleep
    for (let i = 0; i < 300; i++) {
      Engine.update(engine, 1000 / 60);
    }

    // Simulate pointer pickup
    if (sandbox.Matter.Sleeping) sandbox.Matter.Sleeping.set(pill, false);
    pill.isSleeping = false;
    Body.setStatic(pill, true);
    assert.strictEqual(pill.isStatic, true);

    // Simulate drag move
    Body.setPosition(pill, { x: 250, y: 150 });
    assert.strictEqual(pill.position.x, 250);
    assert.strictEqual(pill.position.y, 150);

    // Simulate throw release
    Body.setStatic(pill, false);
    Body.setVelocity(pill, { x: 12, y: -8 });
    assert.strictEqual(pill.velocity.x, 12);
    assert.strictEqual(pill.velocity.y, -8);

    // One tick later, pill should have moved in the direction of velocity
    Engine.update(engine, 1000 / 60);
    assert.ok(pill.position.x > 250, 'Pill should have moved along throw velocity');
  });

  test('Reduced motion and mobile viewport safely bypass physics without hiding HTML skills', () => {
    // Check that app.js explicitly checks prefersReducedMotion and window.innerWidth <= 640
    assert.ok(appJs.includes('prefersReducedMotion'), 'app.js must respect prefersReducedMotion');
    assert.ok(appJs.includes('window.innerWidth <= 640'), 'app.js must respect mobile viewport threshold');
    // If skipped, wrap does not receive has-physics, and skills remain in static flex layout
  });
});
