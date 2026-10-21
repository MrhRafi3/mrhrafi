import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import app from '../api/index.ts';

describe('Vercel Serverless Entry Point Verification', () => {
  test('api/index.ts exports a valid Express application', () => {
    assert.equal(typeof app, 'function');
    assert.equal(typeof app.use, 'function');
    assert.equal(typeof app.listen, 'function');
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
});

