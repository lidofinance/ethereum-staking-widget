import type { NextApiRequest, NextApiResponse } from 'next';

import { LIDO_TOKEN_ADDRESSES } from '../positions';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
type Handlers = {
  portfolioPositionsHandler: Handler;
  portfolioRewardsHandler: Handler;
  portfolioTransactionsHandler: Handler;
};

const LIDO_ADDRESS = [...LIDO_TOKEN_ADDRESSES][0];
const KEY = 'Bearer secret-key';

const row = {
  type: 'token',
  id: 'r1',
  chain_id: 'ethereum',
  chain_id_numeric: 1,
  chain_name: 'Ethereum',
  value_usd: 10,
  attributes: {
    category: 'wallet',
    position_id: 'pos-1',
    token_symbol: 'stETH',
    token_name: 'Liquid staked Ether',
    contract_address: LIDO_ADDRESS,
    decimals: 18,
    amount_string: '1',
    amount: 1,
    price_usd: 10,
    is_spam: false,
    value_incomplete: false,
  },
};

const pnlPayload = {
  data: [
    {
      category: 'wallet',
      position_id: 'pos-1',
      pnl_history: [{ reward_usd: 3 }],
      reward_history: [{ symbol: 'stETH', amount: 1 }],
    },
  ],
};

const payloadFor = (url: string): unknown => {
  if (url.includes('aggregated-pnl-history')) return pnlPayload;
  if (url.includes('/history')) return { data: [], next_page_token: null };
  return { positions: [row] };
};

// per-address hex so no call is served from the service cache
const addr = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;

type SecretConfig = { p2pLambdaAPIKey?: string; p2pLambdaDisabled?: string };
let secrets: SecretConfig = {};

const fetchMock = vi.fn();
// status per url substring, default 200
let failures: Record<string, number> = {};

const mockFetch = () => {
  fetchMock.mockImplementation(async (url: string) => {
    const failed = Object.entries(failures).find(([part]) =>
      url.includes(part),
    );
    const status = failed ? failed[1] : 200;
    return {
      ok: status === 200,
      status,
      json: async () => payloadFor(url),
    };
  });
};

const load = async (cfg: SecretConfig): Promise<Handlers> => {
  secrets = cfg;
  vi.resetModules();
  vi.doMock('config', async (importOriginal) => ({
    ...(await importOriginal<typeof import('config')>()),
    secretConfig: secrets,
  }));
  vi.doMock('../../metrics', () => {
    const counter = { labels: () => ({ inc: () => undefined }) };
    return {
      default: {
        request: {
          portfolioUpstreamRejected: counter,
          portfolioUpstreamCalls: counter,
          portfolioClientLimited: counter,
          portfolioStaleServed: counter,
        },
      },
    };
  });
  vi.doMock('../../fetchApiWrapper', () => ({
    responseTimeExternalMetricWrapper: ({
      request,
    }: {
      request: () => unknown;
    }) => request(),
  }));
  return import('../index') as Promise<Handlers>;
};

const call = async (handler: Handler, address: string) => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    setHeader: () => res,
    end: () => res,
  };
  await handler(
    { query: { address }, headers: {} } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

beforeEach(() => {
  failures = {};
  fetchMock.mockReset();
  mockFetch();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.doUnmock('config');
  vi.doUnmock('../../metrics');
  vi.doUnmock('../../fetchApiWrapper');
});

describe('portfolio index wiring', () => {
  it('valid key: sends it in Authorization and answers 200', async () => {
    const h = await load({ p2pLambdaAPIKey: KEY });
    const res = await call(h.portfolioPositionsHandler, addr(1));
    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(KEY);
  });

  it('serves all three routes with a valid key', async () => {
    const h = await load({ p2pLambdaAPIKey: KEY });
    const a = addr(2);
    expect((await call(h.portfolioPositionsHandler, a)).statusCode).toBe(200);
    expect((await call(h.portfolioRewardsHandler, a)).statusCode).toBe(200);
    expect((await call(h.portfolioTransactionsHandler, a)).statusCode).toBe(
      200,
    );
  });

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['newline', 'Bearer abc\ndef'],
    ['tab', 'abc\tdef'],
    ['DEL', 'abc\u007Fdef'],
  ])('%s key: 404 on every route, no fetch', async (_l, key) => {
    const h = await load({ p2pLambdaAPIKey: key });
    const a = addr(3);
    for (const handler of [
      h.portfolioPositionsHandler,
      h.portfolioRewardsHandler,
      h.portfolioTransactionsHandler,
    ]) {
      expect((await call(handler, a)).statusCode).toBe(404);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('malformed key logs a warning', async () => {
    await load({ p2pLambdaAPIKey: 'a\nb' });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('API_KEY is malformed'),
    );
  });

  it('rewards disabled: only rewards answers 503', async () => {
    const h = await load({
      p2pLambdaAPIKey: KEY,
      p2pLambdaDisabled: 'rewards',
    });
    const a = addr(4);
    expect((await call(h.portfolioPositionsHandler, a)).statusCode).toBe(200);
    expect((await call(h.portfolioRewardsHandler, a)).statusCode).toBe(503);
    expect((await call(h.portfolioTransactionsHandler, a)).statusCode).toBe(
      200,
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes('aggregated-pnl-history'),
      ),
    ).toBe(false);
  });

  it('history disabled: only transactions answers 503', async () => {
    const h = await load({
      p2pLambdaAPIKey: KEY,
      p2pLambdaDisabled: 'history',
    });
    const a = addr(5);
    expect((await call(h.portfolioPositionsHandler, a)).statusCode).toBe(200);
    expect((await call(h.portfolioTransactionsHandler, a)).statusCode).toBe(
      503,
    );
  });

  it.each(['all', 'ALL', 'rewards, all', 'false', 'reward', 'rewards,typo'])(
    'P2P_LAMBDA_DISABLED=%s: every route 503, no fetch',
    async (value) => {
      const h = await load({ p2pLambdaAPIKey: KEY, p2pLambdaDisabled: value });
      const a = addr(6);
      for (const handler of [
        h.portfolioPositionsHandler,
        h.portfolioRewardsHandler,
        h.portfolioTransactionsHandler,
      ]) {
        expect((await call(handler, a)).statusCode).toBe(503);
      }
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('malformed disabled value logs a warning', async () => {
    await load({ p2pLambdaAPIKey: KEY, p2pLambdaDisabled: 'false' });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('P2P_LAMBDA_DISABLED is malformed'),
    );
  });

  it.each([undefined, '', ' '])(
    'disabled=%j: every route is on',
    async (value) => {
      const h = await load({ p2pLambdaAPIKey: KEY, p2pLambdaDisabled: value });
      const a = addr(7);
      expect((await call(h.portfolioPositionsHandler, a)).statusCode).toBe(200);
      expect((await call(h.portfolioRewardsHandler, a)).statusCode).toBe(200);
      expect((await call(h.portfolioTransactionsHandler, a)).statusCode).toBe(
        200,
      );
    },
  );

  it('429 from one scope pauses all scopes', async () => {
    const h = await load({ p2pLambdaAPIKey: KEY });
    failures = { '/history': 429 };
    expect(
      (await call(h.portfolioTransactionsHandler, addr(8))).statusCode,
    ).toBe(503);
    fetchMock.mockClear();
    expect((await call(h.portfolioPositionsHandler, addr(9))).statusCode).toBe(
      503,
    );
    expect((await call(h.portfolioRewardsHandler, addr(10))).statusCode).toBe(
      503,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('402 on positions pauses history but not rewards', async () => {
    const h = await load({ p2pLambdaAPIKey: KEY });
    const cached = addr(11);
    // positions for this address are cached before the quota runs out
    expect((await call(h.portfolioPositionsHandler, cached)).statusCode).toBe(
      200,
    );
    failures = { '/portfolio/positions': 402 };
    const other = addr(12);
    expect((await call(h.portfolioPositionsHandler, other)).statusCode).toBe(
      503,
    );
    failures = {};
    fetchMock.mockClear();
    expect(
      (await call(h.portfolioTransactionsHandler, cached)).statusCode,
    ).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await call(h.portfolioRewardsHandler, cached)).statusCode).toBe(
      200,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('aggregated-pnl');
  });

  it('402 on rewards pauses rewards only', async () => {
    const h = await load({ p2pLambdaAPIKey: KEY });
    const a = addr(13);
    failures = { 'aggregated-pnl-history': 402 };
    expect((await call(h.portfolioRewardsHandler, a)).statusCode).toBe(503);
    failures = {};
    expect((await call(h.portfolioRewardsHandler, addr(14))).statusCode).toBe(
      503,
    );
    expect((await call(h.portfolioPositionsHandler, addr(15))).statusCode).toBe(
      200,
    );
    expect(
      (await call(h.portfolioTransactionsHandler, addr(16))).statusCode,
    ).toBe(200);
  });
});
