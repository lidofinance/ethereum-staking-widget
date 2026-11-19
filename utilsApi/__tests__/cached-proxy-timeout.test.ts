import type { NextApiRequest } from 'next';

import { createCachedProxy } from '../cached-proxy';

// real standardFetcher on purpose: the bound must reach the fetch signal
vi.mock('../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => unknown;
  }) => request(),
}));

describe('createCachedProxy upstream timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
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
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      send: vi.fn(),
      json: vi.fn(),
    } as any;

    const settled = vi.fn();
    const promise = (async () =>
      proxy(
        { query: {}, headers: {} } as unknown as NextApiRequest,
        res,
      ))().catch((e: Error) => {
      settled();
      return e;
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    const error = await promise;

    expect(error).toMatchObject({
      message: 'Request timed out after 10000 ms',
    });
    expect(res.status).toHaveBeenCalledWith(500);
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
    const responses = [1, 2, 3].map(() => ({
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn(),
      send: vi.fn(),
      json: vi.fn(),
    }));
    let finished = false;
    const pending = Promise.allSettled(
      responses.map((response, index) =>
        proxy(
          {
            query: {},
            headers: { 'x-ip': `192.0.2.${index + 1}` },
          } as unknown as NextApiRequest,
          response as any,
        ),
      ),
    ).then((results) => {
      finished = true;
      return results;
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(finished).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(finished).toBe(true);
    expect((await pending).map((result) => result.status)).toEqual([
      'rejected',
      'rejected',
      'rejected',
    ]);
    responses.forEach((response) =>
      expect(response.status).toHaveBeenCalledWith(500),
    );
  });
});
