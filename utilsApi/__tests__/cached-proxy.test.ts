import type { NextApiRequest } from 'next';

import { CACHE_DEFAULT_ERROR_HEADERS } from 'config/groups/cache';
import { standardFetcher } from 'utils/standardFetcher';
import { FetcherError } from 'utils/fetcherError';
import { buildParams } from '../cached-proxy-build-params';
import { createCachedProxy } from '../cached-proxy';

vi.mock('utils/standardFetcher', () => ({ standardFetcher: vi.fn() }));
vi.mock('../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => unknown;
  }) => request(),
}));

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

describe('createCachedProxy error responses', () => {
  const makeRes = () => {
    const res: any = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) {
        this.headers[name.toLowerCase()] = value;
        return this;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json: vi.fn(),
      end: vi.fn(),
    };
    return res;
  };
  const req = { query: { address: '0xabc' } } as unknown as NextApiRequest;
  const proxy = createCachedProxy({
    proxyUrl: 'https://upstream/',
    cacheTTL: 1,
  });

  afterEach(() => {
    vi.mocked(standardFetcher).mockReset();
  });

  it('sends no-store on upstream 5xx so the 500 is not cached', async () => {
    vi.mocked(standardFetcher).mockRejectedValue(
      new FetcherError('bad gateway', 502),
    );
    const res = makeRes();

    await expect(proxy(req, res)).rejects.toThrow('bad gateway');

    expect(res.statusCode).toBe(500);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });

  it('sends no-store on timeout', async () => {
    vi.mocked(standardFetcher).mockRejectedValue(
      new DOMException('timed out', 'TimeoutError'),
    );
    const res = makeRes();

    await expect(proxy(req, res)).rejects.toThrow('timed out');

    expect(res.statusCode).toBe(500);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });

  it('sends no-store on forwarded 4xx', async () => {
    vi.mocked(standardFetcher).mockRejectedValue(
      new FetcherError('not found', 404),
    );
    const res = makeRes();

    await proxy(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.headers['cache-control']).toBe(CACHE_DEFAULT_ERROR_HEADERS);
  });
});

describe('createCachedProxy forwardHeaders', () => {
  const res = () =>
    ({
      setHeader: vi.fn(),
      status: vi.fn(),
      json: vi.fn(),
      end: vi.fn(),
    }) as any;
  const makeReq = (headers: Record<string, string> = {}) =>
    ({ query: {}, headers }) as unknown as NextApiRequest;
  const sentHeaders = () =>
    vi.mocked(standardFetcher).mock.calls[0][1]?.headers as Record<
      string,
      string
    >;

  beforeEach(() => {
    vi.mocked(standardFetcher).mockResolvedValue({ isValid: true });
  });

  afterEach(() => {
    vi.mocked(standardFetcher).mockReset();
  });

  it('sends the headers built from the incoming request upstream', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      forwardHeaders: (req) => ({
        'X-Client-User-Agent': String(req.headers['user-agent']),
      }),
    });

    await proxy(makeReq({ 'user-agent': 'curl/8.5.0' }), res());

    expect(sentHeaders()).toMatchObject({
      'X-Client-User-Agent': 'curl/8.5.0',
      Accept: 'application/json',
    });
  });

  it('cannot override the fixed upstream headers', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
      forwardHeaders: () => ({ Accept: 'text/html' }),
    });

    await proxy(makeReq(), res());

    expect(sentHeaders().Accept).toBe('application/json');
  });

  it('sends only the fixed headers without forwardHeaders', async () => {
    const proxy = createCachedProxy({
      proxyUrl: 'https://upstream/check',
      cacheTTL: 1,
    });

    await proxy(makeReq({ 'user-agent': 'curl/8.5.0' }), res());

    expect(sentHeaders()).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });
});
