import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';

import { enforceJsonOnly } from '../enforce-json-only.js';

const GUARDED = '/api/rpc';

const buildApp = async (
  handlerContentType?: string,
  { rateLimitMax }: { rateLimitMax?: number } = {},
) => {
  const app = Fastify({ logger: false });
  const handler = vi.fn(async (_req, reply) => {
    if (handlerContentType) reply.header('Content-Type', handlerContentType);
    reply.header('Cache-Control', 'no-store');
    return reply.send(handlerContentType ? '{"ok":true}' : { ok: true });
  });
  await app.register(enforceJsonOnly, { paths: [GUARDED] });
  if (rateLimitMax) {
    await app.register(rateLimit, { global: true, max: rateLimitMax });
  }
  app.post(GUARDED, handler);
  app.post('/api/other', async () => ({ ok: true }));
  return { app, handler };
};

// what viem's http transport sends: JSON, no Accept header
const JSON_POST = { 'content-type': 'application/json' };
// what Chromium sends on a top-level form navigation
const NAVIGATION = {
  'content-type': 'application/x-www-form-urlencoded',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

const post = (
  app: Awaited<ReturnType<typeof buildApp>>['app'],
  headers: Record<string, string>,
  payload = '{}',
  url = GUARDED,
) => app.inject({ method: 'POST', url, headers, payload });

describe('enforceJsonOnly request guard', () => {
  it('passes a JSON POST without an Accept header', async () => {
    const { app, handler } = await buildApp();
    const res = await post(app, JSON_POST);
    expect(res.statusCode).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each(['*/*', 'application/json', 'application/json, */*;q=0.5'])(
    'passes Accept %j',
    async (accept) => {
      const { app, handler } = await buildApp();
      await post(app, { ...JSON_POST, accept });
      expect(handler).toHaveBeenCalledTimes(1);
    },
  );

  it('passes a JSON content type with parameters', async () => {
    const { app, handler } = await buildApp();
    await post(app, { 'content-type': 'Application/JSON; charset=utf-8' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('guards the path with a query string', async () => {
    const { app } = await buildApp();
    const res = await post(app, NAVIGATION, 'a=1', `${GUARDED}?chainId=1`);
    expect(res.statusCode).toBe(415);
  });

  it('rejects a form navigation with 415 before the handler runs', async () => {
    const { app, handler } = await buildApp();
    const res = await post(app, NAVIGATION, 'a=1');
    expect(res.statusCode).toBe(415);
    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    'application/x-www-form-urlencoded',
    'text/plain',
    'multipart/form-data; boundary=x',
  ])('rejects a %s body', async (contentType) => {
    const { app } = await buildApp();
    const res = await post(app, { 'content-type': contentType }, 'x');
    expect(res.statusCode).toBe(415);
  });

  it('rejects a POST without a content type', async () => {
    const { app } = await buildApp();
    const res = await app.inject({ method: 'POST', url: GUARDED });
    expect(res.statusCode).toBe(415);
  });

  it.each([
    'text/html',
    'application/xhtml+xml',
    'image/svg+xml',
    'application/json, text/html',
  ])('rejects Accept %j with 406', async (accept) => {
    const { app, handler } = await buildApp();
    const res = await post(app, { ...JSON_POST, accept });
    expect(res.statusCode).toBe(406);
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not require a body type on a GET, leaving it to routing', async () => {
    const { app } = await buildApp();
    const res = await app.inject({ method: 'GET', url: GUARDED });
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toBe('application/json');
  });

  it('leaves other paths alone', async () => {
    const { app } = await buildApp();
    const res = await post(
      app,
      { 'content-type': 'text/plain' },
      'x',
      '/api/other',
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeUndefined();
  });
});

describe('enforceJsonOnly response pin', () => {
  it.each([
    'application/xhtml+xml',
    'image/svg+xml',
    'text/html; charset=utf-8',
    'application/json, text/html',
  ])('pins Content-Type to JSON when the handler sets %j', async (type) => {
    const { app } = await buildApp(type);
    const res = await post(app, JSON_POST);
    expect(res.headers['content-type']).toBe('application/json');
  });

  it('sets a JSON type and a sandbox CSP on a handled reply', async () => {
    const { app } = await buildApp();
    const res = await post(app, JSON_POST);
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.headers['content-security-policy']).toBe('sandbox');
  });

  it('keeps the pin and the sandbox on its own rejections', async () => {
    const { app } = await buildApp();
    const res = await post(app, NAVIGATION, 'a=1');
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.headers['content-security-policy']).toBe('sandbox');
  });

  it('keeps the pin and the sandbox on a rate-limited reply', async () => {
    const { app } = await buildApp(undefined, { rateLimitMax: 1 });
    await post(app, JSON_POST);
    const res = await post(app, JSON_POST);
    expect(res.statusCode).toBe(429);
    expect(res.headers['content-type']).toBe('application/json');
    expect(res.headers['content-security-policy']).toBe('sandbox');
  });

  it('rejects a form navigation before the rate limiter counts it', async () => {
    const { app } = await buildApp(undefined, { rateLimitMax: 1 });
    expect((await post(app, NAVIGATION, 'a=1')).statusCode).toBe(415);
    expect((await post(app, JSON_POST)).statusCode).toBe(200);
  });

  it('leaves other headers alone', async () => {
    const { app } = await buildApp();
    const res = await post(app, JSON_POST);
    expect(res.headers['cache-control']).toBe('no-store');
  });
});
