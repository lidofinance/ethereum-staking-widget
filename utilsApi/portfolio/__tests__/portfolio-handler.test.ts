import type { NextApiRequest, NextApiResponse } from 'next';
import { ZodError } from 'zod';

import { config } from 'config';

import { createClientLimiter } from '../client-limit';
import { LambdaHttpError, type LambdaClient } from '../lambda-client';
import {
  createPortfolioPositionsHandler,
  createPortfolioRewardsHandler,
  createPortfolioService,
  createPortfolioTransactionsHandler,
} from '../portfolio-handler';
import { LIDO_TOKEN_ADDRESSES } from '../positions';
import { UpstreamUnavailableError } from '../upstream-guard';

vi.mock('../../fetchApiWrapper', () => ({
  responseTimeExternalMetricWrapper: ({
    request,
  }: {
    request: () => unknown;
  }) => request(),
}));

const LIDO_ADDRESS = [...LIDO_TOKEN_ADDRESSES][0];
const ADDRESS = '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01';

const row = (address: string, id = 'r1') => ({
  type: 'token',
  id,
  chain_id: 'ethereum',
  chain_id_numeric: 1,
  chain_name: 'Ethereum',
  value_usd: 10,
  attributes: {
    category: 'wallet',
    position_id: 'pos-1',
    token_symbol: 'stETH',
    token_name: 'Liquid staked Ether',
    contract_address: address,
    decimals: 18,
    amount_string: '1',
    amount: 1,
    price_usd: 10,
    is_spam: false,
    value_incomplete: false,
  },
});

const positionsPayload = { positions: [row(LIDO_ADDRESS)] };
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

const historyPayload = { data: [], next_page_token: 'next' };

const makeClient = () => {
  const post = vi.fn(async (path: string, _body?: unknown): Promise<unknown> =>
    path.includes('aggregated-pnl-history') ? pnlPayload : positionsPayload,
  );
  const get = vi.fn(async (_path: string): Promise<unknown> => historyPayload);
  return { post, get } as unknown as LambdaClient & {
    post: typeof post;
    get: typeof get;
  };
};

const makeRes = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, unknown>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    setHeader(k: string, v: unknown) {
      res.headers[k] = v;
      return res;
    },
  };
  return res;
};

const call = async (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  address: unknown,
  headers: Record<string, string> = {},
  query: Record<string, string> = {},
) => {
  const res = makeRes();
  await handler(
    {
      query: address === undefined ? query : { address, ...query },
      headers,
    } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  return res;
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('createPortfolioService', () => {
  it('joins concurrent getPositions into one upstream call', async () => {
    const client = makeClient();
    const service = createPortfolioService(client);
    const [a, b] = await Promise.all([
      service.getPositions('0xa'),
      service.getPositions('0xa'),
    ]);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('serves a second call within TTL from cache', async () => {
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    await service.getPositions('0xa');
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it('caches per address', async () => {
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    await service.getPositions('0xb');
    expect(client.post).toHaveBeenCalledTimes(2);
  });

  it('getRewards reuses cached positions and caches itself', async () => {
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    const first = await service.getRewards('0xa');
    const second = await service.getRewards('0xa');

    const paths = client.post.mock.calls.map(([p]) => p);
    expect(paths.filter((p) => p.includes('positions'))).toHaveLength(1);
    expect(paths.filter((p) => p.includes('pnl'))).toHaveLength(1);
    expect(first.rewards).toHaveLength(1);
    expect(first.rewards[0].rewardsUsd).toBe(3);
    expect(second).toBe(first);
  });

  it('does not retry a failed address upstream right away', async () => {
    const client = makeClient();
    client.post.mockRejectedValueOnce(new Error('boom'));
    const service = createPortfolioService(client);
    await expect(service.getPositions('0xa')).rejects.toThrow('boom');
    await expect(service.getPositions('0xa')).rejects.toThrow(
      UpstreamUnavailableError,
    );
    expect(client.post).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a quota error', new LambdaHttpError(429)],
    ['a budget stop', new UpstreamUnavailableError('budget exceeded')],
  ])('retries an address right away after %s', async (_name, error) => {
    const client = makeClient();
    client.post.mockRejectedValueOnce(error);
    const service = createPortfolioService(client);
    await expect(service.getPositions('0xa')).rejects.toThrow();
    await expect(service.getPositions('0xa')).resolves.toBeDefined();
    expect(client.post).toHaveBeenCalledTimes(2);
  });

  it('asks again soon for rewards of a wallet without Lido tokens', async () => {
    // lru-cache keeps a reference to performance and reads its clock
    let time = performance.now();
    vi.spyOn(performance, 'now').mockImplementation(() => time);
    const client = makeClient();
    client.post.mockImplementation(async (path: string) =>
      path.includes('aggregated-pnl-history') ? pnlPayload : { positions: [] },
    );
    const service = createPortfolioService(client);
    expect((await service.getRewards('0xa')).rewards).toEqual([]);

    // positions and empty rewards both expire after a few minutes
    time += 3 * 60 * 1000;
    client.post.mockImplementation(async (path: string) =>
      path.includes('aggregated-pnl-history') ? pnlPayload : positionsPayload,
    );
    expect((await service.getRewards('0xa')).rewards).toHaveLength(1);
  });

  it('keeps other addresses working after a failure', async () => {
    const client = makeClient();
    client.post.mockRejectedValueOnce(new Error('boom'));
    const service = createPortfolioService(client);
    await expect(service.getPositions('0xa')).rejects.toThrow('boom');
    await expect(service.getPositions('0xb')).resolves.toBeDefined();
  });
});

describe('positions handler', () => {
  it('403 for cross-site browser requests, no upstream call', async () => {
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS, {
      'sec-fetch-site': 'cross-site',
    });
    expect(res.statusCode).toBe(403);
    expect(client.post).not.toHaveBeenCalled();
  });

  it.each(['same-origin', 'same-site', 'none'])(
    'allows sec-fetch-site %s',
    async (site) => {
      const handler = createPortfolioPositionsHandler(
        createPortfolioService(makeClient()),
      );
      const res = await call(handler, ADDRESS, { 'sec-fetch-site': site });
      expect(res.statusCode).toBe(200);
    },
  );

  it('logs no raw error message on 5xx', async () => {
    const client = makeClient();
    client.post.mockRejectedValue(new TypeError('Authorization: secret-key'));
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    await call(handler, ADDRESS);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      'secret-key',
    );
  });

  it('returns tokens without pnl, lowercases address', async () => {
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS);

    expect(res.statusCode).toBe(200);
    const body = res.body as {
      tokens: Record<string, unknown>[];
      dataIncomplete: boolean;
      updatedAt: number;
    };
    expect(body.tokens).toHaveLength(1);
    expect(body.tokens[0]).not.toHaveProperty('pnl');
    expect(JSON.stringify(body)).not.toContain('positionId');
    expect(typeof body.updatedAt).toBe('number');
    expect(client.post.mock.calls[0][1]).toMatchObject({
      wallets: [ADDRESS.toLowerCase()],
    });
  });

  it.each([
    ['missing', undefined],
    ['invalid', 'nope'],
    ['array', [ADDRESS, ADDRESS]],
    ['short', '0x123'],
  ])('422 for %s address, no upstream call', async (_l, address) => {
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, address);
    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({ message: 'Invalid address' });
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
    expect(client.post).not.toHaveBeenCalled();
  });

  it.each([
    ['402', new LambdaHttpError(402), 503],
    ['429', new LambdaHttpError(429), 503],
    ['500', new LambdaHttpError(500), 502],
    ['404', new LambdaHttpError(404), 502],
    ['timeout', Object.assign(new Error('t'), { name: 'TimeoutError' }), 504],
    ['zod', new ZodError([]), 502],
    ['other', new Error('x'), 502],
  ])('maps %s upstream error to %i', async (_l, error, status) => {
    const client = makeClient();
    client.post.mockRejectedValue(error);
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(status);
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
    expect(console.error).toHaveBeenCalled();
    expect(JSON.stringify(res.body)).not.toContain('Lambda request failed');
  });

  it('502 on malformed upstream payload', async () => {
    const client = makeClient();
    client.post.mockResolvedValue({ nope: true });
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ message: 'Unexpected portfolio data format' });
  });
});

describe('rewards handler', () => {
  it('returns rewards for a valid address', async () => {
    const client = makeClient();
    const handler = createPortfolioRewardsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(200);
    const body = res.body as { rewards: { rewardsUsd: number }[] };
    expect(body.rewards[0].rewardsUsd).toBe(3);
  });

  it('422 for invalid address without upstream call', async () => {
    const client = makeClient();
    const handler = createPortfolioRewardsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, 'bad');
    expect(res.statusCode).toBe(422);
    expect(client.post).not.toHaveBeenCalled();
  });

  it('503 on 429 and sets error cache header', async () => {
    const client = makeClient();
    client.post.mockRejectedValue(new LambdaHttpError(429));
    const handler = createPortfolioRewardsHandler(
      createPortfolioService(client),
    );
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(503);
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
  });
});

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// lru-cache keeps a reference to performance and reads its clock
const useClock = () => {
  const clock = { time: performance.now() };
  vi.spyOn(performance, 'now').mockImplementation(() => clock.time);
  return clock;
};

describe('invalid address on every handler', () => {
  const handlers = [
    ['positions', createPortfolioPositionsHandler],
    ['rewards', createPortfolioRewardsHandler],
    ['transactions', createPortfolioTransactionsHandler],
  ] as const;

  describe.each(handlers)('%s', (_name, create) => {
    it.each([
      ['missing', undefined],
      ['array', [ADDRESS, ADDRESS]],
      ['short', '0x123'],
      ['non-hex', '0x' + 'g'.repeat(40)],
    ])('422 for %s address, no upstream call', async (_l, address) => {
      const client = makeClient();
      const res = await call(create(createPortfolioService(client)), address);
      expect(res.statusCode).toBe(422);
      expect(res.body).toEqual({ message: 'Invalid address' });
      expect(client.post).not.toHaveBeenCalled();
      expect(client.get).not.toHaveBeenCalled();
    });
  });
});

describe('snapshots', () => {
  it('answers an upstream failure with the last good answer, marked stale', async () => {
    const clock = useClock();
    const client = makeClient();
    const service = createPortfolioService(client);
    const fresh = await service.getPositions('0xa');
    expect(fresh.stale).toBeUndefined();

    clock.time += 3 * MINUTE;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    client.post.mockRejectedValue(new LambdaHttpError(500));
    const stale = await service.getPositions('0xa');
    expect(stale.stale).toBe(true);
    // counted in metrics; a log line per request would flood during an outage
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    expect(stale.updatedAt).toBe(fresh.updatedAt);
    expect(stale.tokens).toEqual(fresh.tokens);
  });

  it.each([
    ['a timeout', Object.assign(new Error('late'), { name: 'TimeoutError' })],
    ['an upstream 500', new LambdaHttpError(500)],
    ['a used-up quota', new LambdaHttpError(402)],
  ])('covers %s as well', async (_name, error) => {
    const clock = useClock();
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    clock.time += 3 * MINUTE;
    client.post.mockRejectedValue(error);
    expect((await service.getPositions('0xa')).stale).toBe(true);
  });

  it('fails as before for a wallet never answered', async () => {
    const client = makeClient();
    client.post.mockRejectedValue(new UpstreamUnavailableError('budget'));
    const service = createPortfolioService(client);
    await expect(service.getPositions('0xa')).rejects.toThrow(
      UpstreamUnavailableError,
    );
  });

  it('drops a snapshot after a day', async () => {
    const clock = useClock();
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    clock.time += 25 * HOUR;
    client.post.mockRejectedValue(new UpstreamUnavailableError('budget'));
    await expect(service.getPositions('0xa')).rejects.toThrow(
      UpstreamUnavailableError,
    );
  });

  it('goes back to fresh answers when the upstream recovers', async () => {
    const clock = useClock();
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getPositions('0xa');
    clock.time += 3 * MINUTE;
    client.post.mockRejectedValueOnce(new UpstreamUnavailableError('budget'));
    expect((await service.getPositions('0xa')).stale).toBe(true);
    expect((await service.getPositions('0xa')).stale).toBeUndefined();
  });

  it('keeps snapshots of rewards and of each history page', async () => {
    const clock = useClock();
    const client = makeClient();
    const service = createPortfolioService(client);
    await service.getRewards('0xa');
    await service.getTransactions('0xa', null);
    await service.getTransactions('0xa', 'next');

    clock.time += 7 * HOUR;
    const down = new UpstreamUnavailableError('budget');
    client.post.mockRejectedValue(down);
    client.get.mockRejectedValue(down);
    expect((await service.getRewards('0xa')).stale).toBe(true);
    expect((await service.getTransactions('0xa', null)).stale).toBe(true);
    expect((await service.getTransactions('0xa', 'next')).stale).toBe(true);
    await expect(service.getTransactions('0xa', 'other')).rejects.toThrow(
      UpstreamUnavailableError,
    );
  });

  it('serves a stale answer as 200, uncached, and reports it', async () => {
    const clock = useClock();
    const client = makeClient();
    const onStale = vi.fn();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
      { onStale },
    );
    const fresh = await call(handler, ADDRESS);
    expect(fresh.headers['Cache-Control']).toBeUndefined();
    expect((fresh.body as { stale?: true }).stale).toBeUndefined();

    clock.time += 3 * MINUTE;
    client.post.mockRejectedValue(new UpstreamUnavailableError('budget'));
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(200);
    expect((res.body as { stale?: true }).stale).toBe(true);
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
    expect(onStale).toHaveBeenCalledExactlyOnceWith('positions');
  });
});

describe('stETH rewards from the rewards backend', () => {
  const stethRewards = {
    address: LIDO_ADDRESS,
    rewardsUsd: 500,
    rewardsAmount: 0.25,
    rewardsSymbol: 'stETH',
  };
  const pnlCalls = (client: ReturnType<typeof makeClient>) =>
    client.post.mock.calls.filter(([path]) => path.includes('pnl'));

  it('a wallet with stETH only makes no upstream rewards call', async () => {
    const client = makeClient();
    const fetchStethRewards = vi.fn().mockResolvedValue(stethRewards);
    const service = createPortfolioService(client, client, client, {
      fetchStethRewards,
    });

    const answer = await service.getRewards('0xa');
    expect(answer.rewards).toEqual([stethRewards]);
    expect(fetchStethRewards).toHaveBeenCalledWith('0xa');
    expect(pnlCalls(client)).toHaveLength(0);
  });

  it('a failed backend is answered with the kept rewards, not the other source', async () => {
    const clock = useClock();
    const client = makeClient();
    const fetchStethRewards = vi.fn().mockResolvedValue(stethRewards);
    const service = createPortfolioService(client, client, client, {
      fetchStethRewards,
    });
    const fresh = await service.getRewards('0xa');

    // past the rewards cache, within the kept answer
    clock.time += 7 * HOUR;
    fetchStethRewards.mockRejectedValue(new Error('down'));
    const stale = await service.getRewards('0xa');

    expect(stale.stale).toBe(true);
    expect(stale.rewards).toEqual([stethRewards]);
    expect(stale.updatedAt).toBe(fresh.updatedAt);
    expect(pnlCalls(client)).toHaveLength(0);
  });

  it('a failed backend with nothing kept falls back upstream', async () => {
    const client = makeClient();
    const service = createPortfolioService(client, client, client, {
      fetchStethRewards: vi.fn().mockRejectedValue(new Error('down')),
    });

    const answer = await service.getRewards('0xa');
    expect(answer.stale).toBeUndefined();
    expect(answer.rewards[0].rewardsUsd).toBe(3);
    expect(pnlCalls(client)).toHaveLength(1);
  });
});

describe('stale history page', () => {
  it('is served as 200, uncached, without the internal flag', async () => {
    const clock = useClock();
    const client = makeClient();
    const handler = createPortfolioTransactionsHandler(
      createPortfolioService(client),
    );
    expect((await call(handler, ADDRESS)).statusCode).toBe(200);

    clock.time += 6 * MINUTE;
    client.get.mockRejectedValue(new UpstreamUnavailableError('budget'));
    const res = await call(handler, ADDRESS);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ stale: true, nextCursor: 'next' });
    expect(res.body).not.toHaveProperty('upstreamNotCalled');
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
  });
});

describe('separate upstream clients', () => {
  it('sends rewards and history through their own clients', async () => {
    const positions = makeClient();
    const history = makeClient();
    const rewards = makeClient();
    const service = createPortfolioService(positions, history, rewards);
    await service.getRewards('0xa');
    await service.getTransactions('0xa', null);

    expect(positions.post).toHaveBeenCalledTimes(1);
    expect(positions.post.mock.calls[0][0]).not.toContain('pnl');
    expect(rewards.post).toHaveBeenCalledTimes(1);
    expect(rewards.post.mock.calls[0][0]).toContain('aggregated-pnl-history');
    expect(history.get).toHaveBeenCalledTimes(1);
    expect(positions.get).not.toHaveBeenCalled();
  });
});

describe('client limits', () => {
  const CLIENT = { 'cf-connecting-ip': '203.0.113.7' };
  const LIMITS = { addresses: 2, positions: 2, history: 1, rewards: 1 };
  const wallet = (index: number) => `0x${String(index).padStart(40, '0')}`;

  it('answers 429 with Retry-After over the wallet limit, no upstream call', async () => {
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    expect((await call(handler, wallet(2), CLIENT)).statusCode).toBe(200);
    const res = await call(handler, wallet(3), CLIENT);
    expect(res.statusCode).toBe(429);
    expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
    expect(res.headers['Cache-Control']).toBe(
      config.CACHE_DEFAULT_ERROR_HEADERS,
    );
    expect(client.post).toHaveBeenCalledTimes(2);
  });

  it('reports whether a valid request came with a client IP', async () => {
    const onRequest = vi.fn();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(makeClient()),
      { onRequest },
    );
    await call(handler, wallet(1), CLIENT);
    await call(handler, wallet(1));
    await call(handler, wallet(1), { 'cf-connecting-ip': 'not-an-ip' });
    await call(handler, 'not-an-address', CLIENT);
    expect(onRequest.mock.calls).toEqual([
      ['positions', 'present'],
      ['positions', 'absent'],
      ['positions', 'absent'],
    ]);
  });

  it('counts a wallet once whatever its letter case', async () => {
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(makeClient()),
      { limiter: createClientLimiter({ limits: { ...LIMITS, addresses: 1 } }) },
    );
    expect((await call(handler, ADDRESS, CLIENT)).statusCode).toBe(200);
    expect(
      (await call(handler, ADDRESS.toLowerCase(), CLIENT)).statusCode,
    ).toBe(200);
  });

  it('counts only answers that need an upstream call', async () => {
    const client = makeClient();
    const handler = createPortfolioRewardsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    // one upstream call allowed; repeats come from the cache uncounted
    for (let index = 0; index < 5; index += 1) {
      expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    }
    expect((await call(handler, wallet(2), CLIENT)).statusCode).toBe(429);
  });

  it('counts each new history page', async () => {
    const client = makeClient();
    const handler = createPortfolioTransactionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    const res = await call(handler, wallet(1), CLIENT, { cursor: 'next' });
    expect(res.statusCode).toBe(429);
    expect(client.get).toHaveBeenCalledTimes(1);
  });

  it('rejects a bad cursor before any limit is spent', async () => {
    const client = makeClient();
    const handler = createPortfolioTransactionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    const bad = await call(handler, wallet(1), CLIENT, { cursor: 'a b\n' });
    expect(bad.statusCode).toBe(422);
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
  });

  it('limits clients apart and skips requests without a client IP', async () => {
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(makeClient()),
      { limiter: createClientLimiter({ limits: { ...LIMITS, addresses: 1 } }) },
    );
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    expect((await call(handler, wallet(2), CLIENT)).statusCode).toBe(429);
    const other = { 'cf-connecting-ip': '203.0.113.8' };
    expect((await call(handler, wallet(2), other)).statusCode).toBe(200);
    expect((await call(handler, wallet(3))).statusCode).toBe(200);
    expect((await call(handler, wallet(4))).statusCode).toBe(200);
  });

  it('does not count calls a budget stop never made', async () => {
    const client = makeClient();
    client.post.mockRejectedValue(new UpstreamUnavailableError('budget'));
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    // far over the limit of two upstream calls, yet never limited
    for (let index = 0; index < 5; index += 1) {
      expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(503);
    }
  });

  it('does not count a snapshot served instead of a call', async () => {
    const clock = useClock();
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: LIMITS }) },
    );
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(200);
    clock.time += 3 * MINUTE;
    client.post.mockRejectedValue(new UpstreamUnavailableError('budget'));
    for (let index = 0; index < 5; index += 1) {
      const res = await call(handler, wallet(1), CLIENT);
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({ stale: true });
      expect(res.body).not.toHaveProperty('upstreamNotCalled');
    }
  });

  it('still counts a call that was made and failed', async () => {
    const client = makeClient();
    client.post.mockRejectedValue(new LambdaHttpError(500));
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
      { limiter: createClientLimiter({ limits: { ...LIMITS, addresses: 9 } }) },
    );
    expect((await call(handler, wallet(1), CLIENT)).statusCode).toBe(502);
    expect((await call(handler, wallet(2), CLIENT)).statusCode).toBe(502);
    // two upstream calls are spent, so a third wallet is limited
    expect((await call(handler, wallet(3), CLIENT)).statusCode).toBe(429);
  });

  it('counts the positions call a rewards request makes, never uncounted', async () => {
    const positions = makeClient();
    const rewards = makeClient();
    // rewards are stopped, e.g. by the kill switch, after positions were read
    rewards.post.mockRejectedValue(new UpstreamUnavailableError('disabled'));
    const service = createPortfolioService(positions, positions, rewards);
    const handler = createPortfolioRewardsHandler(service, {
      limiter: createClientLimiter({
        limits: { addresses: 9, positions: 2, history: 1, rewards: 2 },
      }),
    });
    const statuses: number[] = [];
    for (let index = 1; index <= 4; index += 1) {
      statuses.push((await call(handler, wallet(index), CLIENT)).statusCode);
    }
    // two positions calls are all this client gets
    expect(statuses).toEqual([503, 503, 429, 429]);
    expect(positions.post).toHaveBeenCalledTimes(2);
  });

  it('does not count positions twice when they are cached', async () => {
    const service = createPortfolioService(makeClient());
    const limiter = createClientLimiter({
      limits: { addresses: 9, positions: 1, history: 1, rewards: 9 },
    });
    const positionsHandler = createPortfolioPositionsHandler(service, {
      limiter,
    });
    const rewardsHandler = createPortfolioRewardsHandler(service, { limiter });
    expect((await call(positionsHandler, wallet(1), CLIENT)).statusCode).toBe(
      200,
    );
    expect((await call(rewardsHandler, wallet(1), CLIENT)).statusCode).toBe(
      200,
    );
  });

  it('logs real upstream failures, not budget stops', async () => {
    const client = makeClient();
    const handler = createPortfolioPositionsHandler(
      createPortfolioService(client),
    );
    client.post.mockRejectedValueOnce(new UpstreamUnavailableError('budget'));
    await call(handler, wallet(1));
    expect(console.error).not.toHaveBeenCalled();
    client.post.mockRejectedValueOnce(new LambdaHttpError(500));
    await call(handler, wallet(2));
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
