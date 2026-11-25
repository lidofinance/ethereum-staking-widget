import type { FastifyReply, FastifyRequest } from 'fastify';

import { buildParams, createCachedProxy } from '../cached-proxy.js';
import {
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_DEFAULT_HEADERS,
} from '../cache-control.js';

describe('buildParams', () => {
  it('returns null when ignoreParams is true', () => {
    expect(buildParams({ a: '1', b: '2' }, true, undefined)).toBeNull();
  });

  it('returns null for an empty query', () => {
    expect(buildParams({}, false, undefined)).toBeNull();
  });

  it('includes all string params when no allow-list is set', () => {
    const out = buildParams({ a: '1', b: '2' }, false, undefined);
    expect(out).not.toBeNull();
    expect(out?.get('a')).toBe('1');
    expect(out?.get('b')).toBe('2');
  });

  it('filters out non-string values (eg. arrays)', () => {
    const out = buildParams({ a: '1', b: ['x', 'y'] }, false, undefined);
    expect(out).not.toBeNull();
    expect(out?.get('a')).toBe('1');
    expect(out?.has('b')).toBe(false);
  });

  it('drops query keys NOT on the allow-list', () => {
    const out = buildParams(
      { address: '0xabc', limit: '10', pad: 'junk', _: 'cache-buster' },
      false,
      ['address', 'limit'],
    );
    expect(out).not.toBeNull();
    expect(out?.get('address')).toBe('0xabc');
    expect(out?.get('limit')).toBe('10');
    expect(out?.has('pad')).toBe(false);
    expect(out?.has('_')).toBe(false);
  });

  it('returns null when all params are filtered out by the allow-list', () => {
    const out = buildParams({ pad1: 'a', pad2: 'b' }, false, ['address']);
    expect(out).toBeNull();
  });

  it('treats an empty allow-list as "filter everything out"', () => {
    const out = buildParams({ address: '0xabc', limit: '10' }, false, []);
    expect(out).toBeNull();
  });
});

describe('createCachedProxy upstream failure', () => {
  it('surfaces the undici cause code in the 502 body, without the URL', async () => {
    const { createCachedProxy } = await import('../cached-proxy.js');
    const Fastify = (await import('fastify')).default;

    const fetchMock = vi.fn().mockRejectedValue(
      Object.assign(new TypeError('fetch failed'), {
        cause: { code: 'ENOTFOUND' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const app = Fastify({ logger: false });
    const proxy = createCachedProxy({
      proxyUrl: 'https://dead-upstream.test/SECRET',
      cacheTTL: 1_000,
    });
    app.get('/p', async (req, reply) => proxy(req, reply));

    const res = await app.inject({ method: 'GET', url: '/p' });

    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({
      error: 'upstream unreachable',
      code: 'ENOTFOUND',
    });
    expect(res.body).not.toContain('SECRET');
    await app.close();
  });
});

describe('createCachedProxy error responses', () => {
  const callProxy = async (fetchMock: ReturnType<typeof vi.fn>) => {
    const { createCachedProxy } = await import('../cached-proxy.js');
    const Fastify = (await import('fastify')).default;
    vi.stubGlobal('fetch', fetchMock);

    const app = Fastify({ logger: false });
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream.test/',
      cacheTTL: 1,
    });
    // routes set public caching before the proxy runs (rewards, validation)
    app.get('/p', async (req, reply) => {
      reply.header('cache-control', CACHE_DEFAULT_HEADERS);
      return proxy(req, reply);
    });

    const res = await app.inject({ method: 'GET', url: '/p?address=0xabc' });
    await app.close();
    return res;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends no-store on upstream 5xx so the error is not cached', async () => {
    const res = await callProxy(
      vi.fn().mockResolvedValue(new Response('{}', { status: 502 })),
    );

    expect(res.statusCode).toBe(502);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });

  it('sends no-store on timeout', async () => {
    const res = await callProxy(
      vi.fn().mockRejectedValue(new DOMException('timed out', 'TimeoutError')),
    );

    expect(res.statusCode).toBe(502);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });

  it('sends no-store on forwarded 4xx', async () => {
    const res = await callProxy(
      vi.fn().mockResolvedValue(new Response('{}', { status: 404 })),
    );

    expect(res.statusCode).toBe(404);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });
});

// direct calls with stub req/reply keep concurrent joins deterministic
type ReplyStub = {
  statusCode: number;
  headers: Record<string, string>;
  sent: unknown;
  code: ReturnType<typeof vi.fn>;
  header: ReturnType<typeof vi.fn>;
  type: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
};

const makeReply = (): ReplyStub => {
  const reply = {
    statusCode: 200,
    headers: {},
    sent: undefined,
  } as ReplyStub;
  reply.code = vi.fn((status: number) => {
    reply.statusCode = status;
    return reply;
  });
  reply.header = vi.fn((name: string, value: string) => {
    reply.headers[name.toLowerCase()] = value;
    return reply;
  });
  reply.type = vi.fn((value: string) => {
    reply.headers['content-type'] = value;
    return reply;
  });
  reply.send = vi.fn((body: unknown) => {
    reply.sent = body;
    return reply;
  });
  return reply;
};

const log = { warn: vi.fn(), error: vi.fn() };
const DEFAULT_QUERY = { address: '0xabc' };
const makeReq = (
  headers: Record<string, string> = {},
  query: Record<string, string> = DEFAULT_QUERY,
) => ({ query, headers, log }) as unknown as FastifyRequest;
const asReply = (reply: ReplyStub) => reply as unknown as FastifyReply;

const okResponse = (data: unknown) =>
  new Response(JSON.stringify(data), { status: 200 });

describe('createCachedProxy forwardHeaders', () => {
  const fetchMock = vi.fn();
  // Headers lowercases names
  const sentHeaders = () =>
    Object.fromEntries(new Headers(fetchMock.mock.calls[0][1]?.headers));

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => okResponse({ isValid: true }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends the headers built from the incoming request upstream', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      forwardHeaders: (req) => ({
        'X-Client-User-Agent': String(req.headers['user-agent']),
      }),
    });

    await proxy(makeReq({ 'user-agent': 'curl/8.5.0' }), asReply(makeReply()));

    expect(sentHeaders()).toMatchObject({
      'x-client-user-agent': 'curl/8.5.0',
      accept: 'application/json',
    });
  });

  it.each<Record<string, string>>([
    { Accept: 'text/html' },
    { accept: 'text/html', 'content-type': 'text/plain' },
  ])('cannot override the fixed upstream headers: %o', async (forwarded) => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      forwardHeaders: () => forwarded,
    });

    await proxy(makeReq(), asReply(makeReply()));

    expect(sentHeaders()).toMatchObject({
      accept: 'application/json',
      'content-type': 'application/json',
    });
  });

  it('sends only the fixed headers without forwardHeaders', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
    });

    await proxy(makeReq({ 'user-agent': 'curl/8.5.0' }), asReply(makeReply()));

    expect(sentHeaders()).toEqual({
      accept: 'application/json',
      'content-type': 'application/json',
    });
  });
});

describe('createCachedProxy byte budget', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serves a body within the budget from cache', async () => {
    fetchMock.mockImplementation(async () => okResponse({ events: [1, 2, 3] }));
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/',
      cacheTTL: 60_000,
      cacheMaxBytes: 1024,
    });

    await proxy(makeReq(), asReply(makeReply()));
    const second = makeReply();
    await proxy(makeReq(), asReply(second));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.sent).toBe('{"events":[1,2,3]}');
    expect(second.headers['content-type']).toBe(
      'application/json; charset=utf-8',
    );
  });

  it('serves a body above the budget without retaining it', async () => {
    const body = { events: 'x'.repeat(2048) };
    fetchMock.mockImplementation(async () => okResponse(body));
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/',
      cacheTTL: 60_000,
      cacheMaxBytes: 1024,
    });

    const first = makeReply();
    await proxy(makeReq(), asReply(first));
    await proxy(makeReq(), asReply(makeReply()));

    expect(first.sent).toBe(JSON.stringify(body));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('createCachedProxy concurrent requests', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches upstream once for identical concurrent requests', async () => {
    const upstream = Promise.withResolvers<Response>();
    fetchMock.mockReturnValue(upstream.promise);
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/',
      cacheTTL: 1000,
    });
    const replies = [makeReply(), makeReply(), makeReply()];

    const calls = replies.map((reply) => proxy(makeReq(), asReply(reply)));
    upstream.resolve(okResponse({ ok: true }));
    await Promise.all(calls);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    replies.forEach((reply) => expect(reply.sent).toBe('{"ok":true}'));
  });

  it.each([
    { label: 'HTTP 500', failure: { status: 500 }, status: 502 },
    { label: 'HTTP 502', failure: { status: 502 }, status: 502 },
    { label: 'HTTP 503', failure: { status: 503 }, status: 502 },
    {
      label: 'timeout',
      failure: new DOMException('timeout', 'TimeoutError'),
      status: 502,
    },
    {
      label: 'network error',
      failure: new TypeError('Failed to fetch'),
      status: 502,
    },
    { label: 'HTTP 403', failure: { status: 403 }, status: 403 },
    { label: 'HTTP 404', failure: { status: 404 }, status: 404 },
  ])(
    'shares $label without retrying for each waiting client',
    async ({ failure, status }) => {
      const upstream = Promise.withResolvers<Response>();
      fetchMock.mockReturnValueOnce(upstream.promise);
      const proxy = createCachedProxy({
        proxyUrl: 'https://upstream/',
        cacheTTL: 1000,
        forwardHeaders: (request) => ({
          'X-Client-IP': String(request.headers['x-ip']),
        }),
      });
      const replies = [makeReply(), makeReply(), makeReply()];
      const pending = Promise.all(
        replies.map((reply, index) =>
          proxy(makeReq({ 'x-ip': `192.0.2.${index + 1}` }), asReply(reply)),
        ),
      );

      if (failure instanceof Error) upstream.reject(failure);
      else upstream.resolve(new Response('{}', failure));
      await pending;

      expect(fetchMock).toHaveBeenCalledTimes(1);
      replies.forEach((reply) => {
        expect(reply.statusCode).toBe(status);
        expect(reply.headers['cache-control']).toBe(
          CACHE_DEFAULT_ERROR_HEADERS,
        );
      });
    },
  );

  it('does not share a failed fetch with later requests', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 502 }))
      .mockResolvedValueOnce(okResponse({ ok: true }));
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/',
      cacheTTL: 1000,
    });

    const first = [makeReply(), makeReply()];
    await Promise.all(first.map((reply) => proxy(makeReq(), asReply(reply))));
    first.forEach((reply) => expect(reply.statusCode).toBe(502));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const later = makeReply();
    await proxy(makeReq(), asReply(later));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(later.sent).toBe('{"ok":true}');
  });

  it('with forwarded client headers, a request joining a failed fetch retries with its own headers', async () => {
    const first = Promise.withResolvers<Response>();
    fetchMock
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(okResponse({ isValid: true }));
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/',
      cacheTTL: 1000,
      forwardHeaders: (r) => ({ 'X-Client-IP': String(r.headers['x-ip']) }),
    });
    const limited = makeReply();
    const joined = makeReply();

    const calls = [
      proxy(makeReq({ 'x-ip': '1.1.1.1' }), asReply(limited)),
      proxy(makeReq({ 'x-ip': '2.2.2.2' }), asReply(joined)),
    ];
    // the upstream limits the first caller's IP only
    first.resolve(new Response('{}', { status: 429 }));
    await Promise.all(calls);

    expect(limited.statusCode).toBe(429);
    expect(joined.sent).toBe('{"isValid":true}');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);
    expect(retryHeaders.get('X-Client-IP')).toBe('2.2.2.2');
  });
});
