import Fastify from 'fastify';

import { markNotReady, markReady } from '../../../../scripts/readiness.mjs';
import { rateLimitPlugin } from '../../plugins/rate-limit.js';
import { readinessRoute } from '../readiness.js';

const buildApp = async () => {
  const app = Fastify({ logger: false });
  await app.register(rateLimitPlugin, { max: 1, timeWindow: 60_000 });
  await app.register(readinessRoute);
  return app;
};

describe('/api/readiness', () => {
  it('is 503 until marked ready, then 200, and 503 again on shutdown', async () => {
    const app = await buildApp();

    markNotReady('starting');
    const starting = await app.inject({ url: '/api/readiness' });
    expect(starting.statusCode).toBe(503);
    expect(starting.json()).toEqual({
      status: 'not-ready',
      reason: 'starting',
    });
    expect(starting.headers['cache-control']).toBe('no-store');

    markReady();
    const ready = await app.inject({ url: '/api/readiness' });
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toEqual({ status: 'ready' });

    markNotReady('SIGTERM');
    const draining = await app.inject({ url: '/api/readiness' });
    expect(draining.statusCode).toBe(503);

    await app.close();
  });

  it('is exempt from the global rate limit', async () => {
    const app = await buildApp();
    markReady();

    for (let i = 0; i < 5; i += 1) {
      const res = await app.inject({ url: '/api/readiness' });
      expect(res.statusCode).toBe(200);
    }

    await app.close();
  });
});
