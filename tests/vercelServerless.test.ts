import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import app from '../api/index.ts';

describe('Vercel Serverless Entry Point & Routing Verification', () => {
  test('api/index.ts exports a valid Express application', () => {
    assert.equal(typeof app, 'function');
    assert.equal(typeof app.use, 'function');
    assert.equal(typeof app.listen, 'function');
  });

  test('Vercel serverless entry point responds to root GET / with frontend index.html', async () => {
    const server: Server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('<!DOCTYPE html>'), 'Root response must include HTML doctype');
      assert.ok(text.includes('Mrh Rafi'), 'Root response must include developer name');
      assert.ok(text.includes('id="projects"'), 'Root response must include projects section');
    } finally {
      server.close();
    }
  });

  test('Vercel serverless entry point responds to API routes', async () => {
    const server: Server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      // 1. Health check
      const healthRes = await fetch(`${baseUrl}/api/health`);
      assert.equal(healthRes.status, 200);
      const healthData = await healthRes.json();
      assert.equal(healthData.status, 'ok');

      // 2. Portfolio profile
      const portRes = await fetch(`${baseUrl}/api/portfolio`);
      assert.equal(portRes.status, 200);
      const portData = await portRes.json();
      assert.equal(portData.name, 'Mrh Rafi');
    } finally {
      server.close();
    }
  });

  test('vercel.json routing rules guarantee root frontend delivery and API endpoints', () => {
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    assert.ok(fs.existsSync(vercelConfigPath), 'vercel.json must exist');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

    assert.equal(vercelConfig.version, 2);
    assert.ok(Array.isArray(vercelConfig.rewrites), 'rewrites array must exist');

    // Verify API rewrites exist before catch-all
    const apiRewrite = vercelConfig.rewrites.find((r: { source: string }) => r.source === '/api/(.*)');
    assert.ok(apiRewrite, 'API rewrite /api/(.*) must be defined');
    assert.equal(apiRewrite.destination, '/api');

    // Verify Root / SPA rewrites exist
    const rootRewrite = vercelConfig.rewrites.find((r: { source: string }) => r.source === '/');
    assert.ok(rootRewrite, 'Root rewrite / must be defined');
    assert.equal(rootRewrite.destination, '/index.html');

    // Verify static public folder files exist
    assert.ok(fs.existsSync(path.resolve(process.cwd(), 'public/index.html')), 'public/index.html must exist');
    assert.ok(fs.existsSync(path.resolve(process.cwd(), 'public/style.css')), 'public/style.css must exist');
    assert.ok(fs.existsSync(path.resolve(process.cwd(), 'public/app.js')), 'public/app.js must exist');
  });
});
