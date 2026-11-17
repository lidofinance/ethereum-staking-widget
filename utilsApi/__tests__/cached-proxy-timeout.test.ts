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
});
