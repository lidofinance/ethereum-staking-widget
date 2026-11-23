import { ZodError } from 'zod';

import type { LambdaClient } from '../lambda-client';
import type { PortfolioTokenWithPnl } from '../positions';
import { LIDO_TOKEN_ADDRESSES } from '../positions';
import {
  StethRewardsUnavailableError,
  fetchLidoRewards,
  parsePnlResponse,
} from '../rewards';
import { STETH_MAINNET_ADDRESS } from '../steth-rewards';

const LIDO_ADDRESS = [...LIDO_TOKEN_ADDRESSES][0];

const makeToken = (
  overrides: Partial<PortfolioTokenWithPnl> = {},
): PortfolioTokenWithPnl => ({
  id: 't',
  chainId: 1,
  chainSlug: 'ethereum',
  chainName: 'Ethereum',
  address: LIDO_ADDRESS,
  isNative: false,
  symbol: 'stETH',
  name: 'stETH',
  decimals: 18,
  amountRaw: '1',
  amount: 1,
  priceUsd: 1,
  valueUsd: 1,
  isLido: true,
  pnl: { category: 'wallet', positionId: 'Pos-A' },
  ...overrides,
});

describe('parsePnlResponse', () => {
  it('sums reward_usd increments and single-symbol amounts', () => {
    const result = parsePnlResponse(
      {
        data: [
          {
            category: 'wallet',
            position_id: 'pos-a',
            pnl_history: [
              { reward_usd: 1.5 },
              { reward_usd: 2 },
              { reward_usd: 0.5 },
            ],
            reward_history: [
              { symbol: 'stETH', amount: 0.1 },
              { symbol: 'stETH', amount: 0.2 },
            ],
          },
        ],
      },
      [makeToken()],
    );
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe(LIDO_ADDRESS);
    expect(result[0].rewardsUsd).toBe(4);
    expect(result[0].rewardsAmount).toBeCloseTo(0.3);
    expect(result[0].rewardsSymbol).toBe('stETH');
  });

  it('nulls amount/symbol for multiple symbols', () => {
    const [r] = parsePnlResponse(
      {
        data: [
          {
            category: 'wallet',
            position_id: 'pos-a',
            pnl_history: [{ reward_usd: 3 }],
            reward_history: [
              { symbol: 'stETH', amount: 1 },
              { symbol: 'LDO', amount: 2 },
            ],
          },
        ],
      },
      [makeToken()],
    );
    expect(r.rewardsUsd).toBe(3);
    expect(r.rewardsAmount).toBeNull();
    expect(r.rewardsSymbol).toBeNull();
  });

  it('nulls amount/symbol when reward_history missing or empty', () => {
    const base = { category: 'wallet', position_id: 'pos-a', pnl_history: [] };
    for (const row of [base, { ...base, reward_history: [] }]) {
      const [r] = parsePnlResponse({ data: [row] }, [makeToken()]);
      expect(r.rewardsUsd).toBe(0);
      expect(r.rewardsAmount).toBeNull();
      expect(r.rewardsSymbol).toBeNull();
    }
  });

  it('matches position_id case-insensitively but category exactly', () => {
    const data = {
      data: [
        {
          category: 'wallet',
          position_id: 'POS-A',
          pnl_history: [{ reward_usd: 1 }],
        },
        {
          category: 'other',
          position_id: 'pos-a',
          pnl_history: [{ reward_usd: 9 }],
        },
      ],
    };
    const [r] = parsePnlResponse(data, [makeToken()]);
    expect(r.rewardsUsd).toBe(1);
  });

  it('skips tokens without pnl key, without address, or without row', () => {
    const data = {
      data: [{ category: 'wallet', position_id: 'pos-a', pnl_history: [] }],
    };
    expect(
      parsePnlResponse(data, [
        makeToken({ pnl: null }),
        makeToken({ address: null }),
        makeToken({ pnl: { category: 'wallet', positionId: 'nope' } }),
      ]),
    ).toEqual([]);
  });

  it('skips invalid rows', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = parsePnlResponse(
      {
        data: [
          { category: 'wallet' },
          {
            category: 'wallet',
            position_id: 'pos-a',
            pnl_history: [{ reward_usd: 2 }],
          },
        ],
      },
      [makeToken()],
    );
    expect(result[0].rewardsUsd).toBe(2);
    expect(warn).toHaveBeenCalledWith(
      '[portfolio] skipped 1 unexpected pnl rows',
    );
    warn.mockRestore();
  });

  it.each([null, {}, { data: 'x' }])('throws ZodError on %j', (data) => {
    expect(() => parsePnlResponse(data, [makeToken()])).toThrow(ZodError);
  });
});

describe('fetchLidoRewards', () => {
  it('does not call client without Lido tokens with pnl keys', async () => {
    const post = vi.fn();
    const client = { post, get: vi.fn() } as LambdaClient;
    expect(
      await fetchLidoRewards(client, '0xabc', [
        makeToken({ isLido: false }),
        makeToken({ pnl: null }),
      ]),
    ).toEqual([]);
    expect(await fetchLidoRewards(client, '0xabc', [])).toEqual([]);
    expect(post).not.toHaveBeenCalled();
  });

  it('sends the expected request body and returns parsed rewards', async () => {
    const post = vi.fn().mockResolvedValue({
      data: [
        {
          category: 'wallet',
          position_id: 'pos-a',
          pnl_history: [{ reward_usd: 7 }],
          reward_history: [{ symbol: 'stETH', amount: 0.5 }],
        },
      ],
    });
    const now = 1_700_000_000_000;
    const result = await fetchLidoRewards(
      { post, get: vi.fn() },
      '0xabc',
      [makeToken(), makeToken({ isLido: false, id: 'x' })],
      now,
    );

    expect(post).toHaveBeenCalledTimes(1);
    const [path, body, timeout] = post.mock.calls[0];
    expect(path).toBe('/api/v1/chains/ethereum/aggregated-pnl-history');
    expect(body).toEqual({
      positions: [
        { address: '0xabc', category: 'wallet', position_id: 'Pos-A' },
      ],
      start_timestamp: Date.UTC(2022, 3, 1),
      end_timestamp: now,
      granularity: 'month',
      points_limit: 366,
    });
    expect(timeout).toBeGreaterThan(0);
    expect(result).toEqual([
      {
        address: LIDO_ADDRESS,
        rewardsUsd: 7,
        rewardsAmount: 0.5,
        rewardsSymbol: 'stETH',
      },
    ]);
  });
});

describe('fetchLidoRewards with the stETH rewards source', () => {
  const WALLET = '0xabc';
  const NOW = 1_700_000_000_000;
  const OTHER_LIDO_ADDRESS = [...LIDO_TOKEN_ADDRESSES].find(
    (address) => address !== STETH_MAINNET_ADDRESS,
  );
  const stethToken = makeToken({
    address: STETH_MAINNET_ADDRESS,
    pnl: { category: 'lido-steth-staking', positionId: 'Pos-Steth' },
  });
  const otherToken = makeToken({
    id: 'other',
    address: OTHER_LIDO_ADDRESS,
    symbol: 'wstETH',
    pnl: { category: 'lido-wsteth-holding', positionId: 'Pos-Other' },
  });
  const stethRewards = {
    address: STETH_MAINNET_ADDRESS,
    rewardsUsd: 500,
    rewardsAmount: 0.25,
    rewardsSymbol: 'stETH',
  };
  const upstreamRow = (category: string, positionId: string, usd: number) => ({
    category,
    position_id: positionId,
    pnl_history: [{ reward_usd: usd }],
    reward_history: [{ symbol: 'stETH', amount: 0.1 }],
  });
  const sentPositionIds = (post: ReturnType<typeof vi.fn>) =>
    (
      post.mock.calls[0][1] as { positions: { position_id: string }[] }
    ).positions.map((position) => position.position_id);

  it('takes stETH from the source and asks upstream for the rest only', async () => {
    const post = vi.fn().mockResolvedValue({
      data: [upstreamRow('lido-wsteth-holding', 'pos-other', 30)],
    });
    const fetchStethRewards = vi.fn().mockResolvedValue(stethRewards);

    const result = await fetchLidoRewards(
      { post, get: vi.fn() },
      WALLET,
      [stethToken, otherToken],
      NOW,
      { fetchStethRewards },
    );

    expect(fetchStethRewards).toHaveBeenCalledWith(WALLET);
    expect(sentPositionIds(post)).toEqual(['Pos-Other']);
    expect(result).toEqual([
      stethRewards,
      expect.objectContaining({ address: OTHER_LIDO_ADDRESS, rewardsUsd: 30 }),
    ]);
  });

  it('makes no upstream call for a wallet with stETH only', async () => {
    const post = vi.fn();
    const result = await fetchLidoRewards(
      { post, get: vi.fn() },
      WALLET,
      [stethToken],
      NOW,
      { fetchStethRewards: vi.fn().mockResolvedValue(stethRewards) },
    );
    expect(post).not.toHaveBeenCalled();
    expect(result).toEqual([stethRewards]);
  });

  it('does not ask the source for a wallet without stETH', async () => {
    const post = vi.fn().mockResolvedValue({
      data: [upstreamRow('lido-wsteth-holding', 'pos-other', 30)],
    });
    const fetchStethRewards = vi.fn();
    await fetchLidoRewards({ post, get: vi.fn() }, WALLET, [otherToken], NOW, {
      fetchStethRewards,
    });
    expect(fetchStethRewards).not.toHaveBeenCalled();
    expect(sentPositionIds(post)).toEqual(['Pos-Other']);
  });

  it('falls back upstream for stETH when the source fails and nothing is kept', async () => {
    const post = vi.fn().mockResolvedValue({
      data: [
        upstreamRow('lido-steth-staking', 'pos-steth', 430),
        upstreamRow('lido-wsteth-holding', 'pos-other', 30),
      ],
    });
    const result = await fetchLidoRewards(
      { post, get: vi.fn() },
      WALLET,
      [stethToken, otherToken],
      NOW,
      { fetchStethRewards: vi.fn().mockRejectedValue(new Error('down')) },
    );
    expect(sentPositionIds(post)).toEqual(['Pos-Steth', 'Pos-Other']);
    expect(result.map((rewards) => rewards.rewardsUsd)).toEqual([430, 30]);
  });

  it('prefers a kept answer to the other source: no upstream call', async () => {
    const post = vi.fn();
    await expect(
      fetchLidoRewards(
        { post, get: vi.fn() },
        WALLET,
        [stethToken, otherToken],
        NOW,
        {
          fetchStethRewards: vi.fn().mockRejectedValue(new Error('down')),
          hasSavedRewards: true,
        },
      ),
    ).rejects.toBeInstanceOf(StethRewardsUnavailableError);
    expect(post).not.toHaveBeenCalled();
  });
});
