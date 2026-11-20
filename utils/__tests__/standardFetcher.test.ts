import { standardFetcher } from '../standardFetcher';

const jsonResponse = (body: unknown = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const getSentHeaders = (fetchMock: ReturnType<typeof vi.fn>): Headers =>
  fetchMock.mock.calls[0][1].headers;

describe('standardFetcher headers', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Content-Type here would force a CORS preflight
  it('omits Content-Type on a request without a body', async () => {
    await standardFetcher('https://example.com/manifest.json');

    expect(getSentHeaders(fetchMock).has('content-type')).toBe(false);
  });

  it('omits Content-Type when the caller passes its own headers', async () => {
    await standardFetcher('https://example.com/manifest.json', {
      headers: { Accept: 'application/json' },
    });

    const headers = getSentHeaders(fetchMock);
    expect(headers.has('content-type')).toBe(false);
    expect(headers.get('accept')).toBe('application/json');
  });

  it('sends Content-Type when there is a body', async () => {
    await standardFetcher('https://example.com/orders', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });

    expect(getSentHeaders(fetchMock).get('content-type')).toBe(
      'application/json',
    );
  });

  it('keeps the server-side User-Agent on bodyless requests', async () => {
    await standardFetcher('https://example.com/manifest.json');

    expect(getSentHeaders(fetchMock).get('user-agent')).toMatch(
      /^lido-staking-widget\//,
    );
  });

  it('lets the caller override a default header', async () => {
    await standardFetcher('https://example.com/orders', {
      method: 'POST',
      body: '<xml/>',
      headers: { 'Content-Type': 'application/xml' },
    });

    expect(getSentHeaders(fetchMock).get('content-type')).toBe(
      'application/xml',
    );
  });
});

describe('standardFetcher abort signals', () => {
  // a fetch that never resolves until its signal aborts
  const hangingFetch = () =>
    vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          if (init.signal?.aborted) reject(init.signal.reason);
          init.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
          );
        }),
    );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('aborts the request when the caller signal aborts', async () => {
    vi.stubGlobal('fetch', hangingFetch());
    const caller = new AbortController();

    const promise = standardFetcher('https://example.com/x', {
      signal: caller.signal,
      timeoutMs: 10_000,
    });
    const assertion = expect(promise).rejects.toBe('caller cancelled');
    caller.abort('caller cancelled');

    await assertion;
  });

  it('aborts immediately when the caller signal is already aborted', async () => {
    vi.stubGlobal('fetch', hangingFetch());
    const caller = new AbortController();
    caller.abort('early');

    await expect(
      standardFetcher('https://example.com/x', { signal: caller.signal }),
    ).rejects.toBe('early');
  });

  it('still times out when a caller signal is present', async () => {
    vi.stubGlobal('fetch', hangingFetch());
    const caller = new AbortController();

    const promise = standardFetcher('https://example.com/x', {
      signal: caller.signal,
      timeoutMs: 1_000,
    });
    const assertion = expect(promise).rejects.toThrow(
      'Request timed out after 1000 ms',
    );
    await vi.advanceTimersByTimeAsync(1_000);

    await assertion;
    expect(caller.signal.aborted).toBe(false);
  });
});
