import type { FastifyReply, FastifyRequest } from 'fastify';

import { createCachedProxy } from '../cached-proxy.js';

const makeReply = () => {
  const reply = {
    statusCode: 200,
    sent: undefined as unknown,
    code: vi.fn((status: number) => {
      reply.statusCode = status;
      return reply;
    }),
    header: vi.fn(() => reply),
    type: vi.fn(() => reply),
    send: vi.fn((body: unknown) => {
      reply.sent = body;
      return reply;
    }),
  };
  return reply;
};

const makeReq = (headers: Record<string, string> = {}) =>
  ({
    query: {},
    headers,
    log: { warn: vi.fn(), error: vi.fn() },
  }) as unknown as FastifyRequest;

describe('createCachedProxy upstream timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // a stalled upstream: settles only when the signal aborts
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(init.signal?.reason),
            );
          }),
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('aborts a stalled upstream at the configured timeout', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      timeout: 10_000,
    });
    const reply = makeReply();

    const settled = vi.fn();
    const promise = proxy(makeReq(), reply as unknown as FastifyReply).then(
      settled,
    );

    await vi.advanceTimersByTimeAsync(9_999);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(settled).toHaveBeenCalled();
    expect(reply.statusCode).toBe(502);
    expect(reply.sent).toEqual({
      error: 'upstream unreachable',
      code: 'UPSTREAM_TIMEOUT',
    });
  });

  it('finishes joined client requests at the original timeout without starting more fetches', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      timeout: 10_000,
      forwardHeaders: (request) => ({
        'X-Client-IP': String(request.headers['x-ip']),
      }),
    });
    const replies = [1, 2, 3].map(() => makeReply());
    let finished = false;
    const pending = Promise.all(
      replies.map((reply, index) =>
        proxy(
          makeReq({ 'x-ip': `192.0.2.${index + 1}` }),
          reply as unknown as FastifyReply,
        ),
      ),
    ).then(() => {
      finished = true;
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(finished).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(finished).toBe(true);
    replies.forEach((reply) => expect(reply.statusCode).toBe(502));
  });
});
