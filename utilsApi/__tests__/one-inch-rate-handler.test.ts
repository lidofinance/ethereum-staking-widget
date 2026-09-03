import type { NextApiRequest, NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

import {
  createOneInchRateHandler,
  type OneInchRateResponse,
} from '../one-inch-rate-handler';

type MockRes = NextApiResponse & {
  _status: number;
  _sent: unknown;
  _headers: Record<string, string>;
};

const makeReq = (query: NextApiRequest['query']): NextApiRequest =>
  ({
    method: 'GET',
    headers: {},
    query,
  }) as NextApiRequest;

const makeRes = (): MockRes => {
  const res: any = {
    _status: 0,
    _sent: undefined,
    _headers: {},
    setHeader(name: string, value: string) {
      this._headers[name] = value;
      return this;
    },
    status(code: number) {
      this._status = code;
      return this;
    },
    json(body: unknown) {
      this._sent = body;
      return this;
    },
  };
  return res as MockRes;
};

const makeFetcher = (body: unknown, status = 200) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  ) as unknown as typeof fetch;

const callHandler = async (
  query: NextApiRequest['query'],
  fetcher: typeof fetch,
  cache = new LRUCache<string, OneInchRateResponse>({ max: 10 }),
) => {
  const res = makeRes();
  const handler = createOneInchRateHandler({
    apiKey: 'test-api-key',
    fetcher,
    cache,
  });
  await handler(makeReq(query), res);
  return res;
};

describe('createOneInchRateHandler', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('returns the ETH to stETH rate using the default one ETH amount', async () => {
    const fetcher = makeFetcher({ toTokenAmount: '1005000000000000000' });
    const res = await callHandler({ token: 'ETH' }, fetcher);

    expect(res._status).toBe(200);
    expect(res._sent).toEqual({
      rate: 1.005,
      toReceive: '1005000000000000000',
      fromAmount: '1000000000000000000',
    });

    const [url, options] = vi.mocked(fetcher).mock.calls[0];
    const parsedUrl = new URL(url as string);
    expect(parsedUrl.origin).toBe('https://api.1inch.com');
    expect(parsedUrl.pathname).toBe('/fusion/quoter/v2.0/1/quote/receive/');
    expect(parsedUrl.searchParams.get('fromTokenAddress')).toBe(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    );
    expect(parsedUrl.searchParams.get('toTokenAddress')?.toLowerCase()).toBe(
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    );
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer test-api-key',
    });
  });

  it('supports a custom amount for stETH to ETH quotes', async () => {
    const fetcher = makeFetcher({ toTokenAmount: '500000000000000000' });
    const res = await callHandler(
      { token: 'steth', amount: '500000000000000000' },
      fetcher,
    );

    expect(res._status).toBe(200);
    const [url] = vi.mocked(fetcher).mock.calls[0];
    const parsedUrl = new URL(url as string);
    expect(parsedUrl.searchParams.get('fromTokenAddress')?.toLowerCase()).toBe(
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    );
    expect(parsedUrl.searchParams.get('toTokenAddress')).toBe(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );
  });

  it('caches equal quotes', async () => {
    const fetcher = makeFetcher({ toTokenAmount: '1000000000000000000' });
    const cache = new LRUCache<string, OneInchRateResponse>({ max: 10 });
    const handler = createOneInchRateHandler({
      apiKey: 'test-api-key',
      fetcher,
      cache,
    });

    await handler(makeReq({ token: 'ETH' }), makeRes());
    const cachedRes = makeRes();
    await handler(makeReq({ token: 'eth' }), cachedRes);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(cachedRes._status).toBe(200);
  });

  it.each([
    [{}, 'Invalid token'],
    [{ token: ['ETH', 'STETH'] }, 'Invalid token'],
    [{ token: 'DAI' }, 'token must be one of the following values'],
    [{ token: 'ETH', amount: '1' }, 'amount is not allowed with token ETH'],
    [{ token: 'STETH', amount: '-1' }, 'Invalid amount'],
    [{ token: 'STETH', amount: '0' }, 'Amount must be positive'],
    [{ token: 'STETH', amount: '1' }, 'Amount too small'],
  ])('rejects invalid query %#', async (query, message) => {
    const fetcher = makeFetcher({ toTokenAmount: '1' });
    const res = await callHandler(query, fetcher);

    expect(res._status).toBe(422);
    expect(res._sent).toMatchObject({
      message: expect.stringContaining(message),
    });
    expect(res._headers['Cache-Control']).toBe('no-store, must-revalidate');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed when 1inch returns an invalid response', async () => {
    const fetcher = makeFetcher({ unexpected: 'value' });
    const res = await callHandler({ token: 'ETH' }, fetcher);

    expect(res._status).toBe(502);
    expect(res._sent).toEqual({ message: 'Failed to fetch 1inch rate' });
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it('does not expose an upstream error body', async () => {
    const fetcher = makeFetcher({ message: 'secret upstream detail' }, 401);
    const res = await callHandler({ token: 'ETH' }, fetcher);

    expect(res._status).toBe(502);
    expect(res._sent).toEqual({ message: 'Failed to fetch 1inch rate' });
  });
});
