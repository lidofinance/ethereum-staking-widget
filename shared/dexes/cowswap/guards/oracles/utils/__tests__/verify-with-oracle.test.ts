import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';

import mainnetNetwork from 'networks/mainnet.json';

import {
  CHAINLINK_FEEDS,
  CHAINLINK_SCALE,
  ORACLE_PRICES,
  PRICE_BOUNDS,
  WSTETH_ADDRESS,
  type ChainlinkFeedKey,
} from '../../feeds';
import {
  FAIL_UNAVAILABLE,
  FAIL_UNSUPPORTED,
  PARTNER_FEE_PCT,
} from '../../consts';
import type { OnTradeParamsPayload } from '../../types';
import {
  readSellTokenUsd,
  verifyWithOracle,
  type OracleClient,
  type OracleFeedMaps,
} from '../verify-with-oracle';
import { TEST_PROFILE } from '../../../tx/__tests__/fixtures';
import type { RoundData } from '../rounds';

const c = mainnetNetwork.contracts;
const STETH = c.lido.toLowerCase();
const WSTETH = c.wsteth.toLowerCase();
const USDC = c.usdc.toLowerCase();
const WETH = c.weth.toLowerCase();
const LDO = c.ldo.toLowerCase();
const WBTC = c.wbtc.toLowerCase();
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const UNKNOWN = '0x0000000000000000000000000000000000000001';

const FEEDS = TEST_PROFILE.oracleFeeds;
const NOW_SEC = 1_700_000_000n;

const round = (answer: bigint, updatedAt = NOW_SEC - 60n): RoundData => [
  10n,
  answer,
  updatedAt,
  updatedAt,
  10n,
];

const usd = (value: number) => BigInt(Math.round(value * 1e8));

type Prices = Partial<Record<ChainlinkFeedKey, RoundData | Error>>;

const makeClient = (
  prices: Prices,
  wstethRate: bigint | Error = 1_200_000_000_000_000_000n,
) => {
  const byAddress = new Map<string, RoundData | Error>(
    Object.entries(prices).map(([key, value]) => [
      CHAINLINK_FEEDS[key as ChainlinkFeedKey].address.toLowerCase(),
      value,
    ]),
  );

  const readContract = vi.fn(
    async ({
      address,
      functionName,
    }: {
      address: Address;
      functionName: string;
    }) => {
      const value =
        functionName === 'stEthPerToken'
          ? wstethRate
          : byAddress.get(address.toLowerCase());
      if (value === undefined) throw new Error(`no mock for ${address}`);
      if (value instanceof Error) throw value;
      return value;
    },
  );

  return { readContract } as unknown as OracleClient & {
    readContract: typeof readContract;
  };
};

const makePayload = (
  overrides: Partial<Record<string, unknown>> = {},
): OnTradeParamsPayload =>
  ({
    sellToken: { address: STETH, symbol: 'stETH' },
    buyToken: { address: USDC, symbol: 'USDC' },
    sellTokenAmount: { units: '1' },
    buyTokenAmount: { units: '1990' },
    ...overrides,
  }) as unknown as OnTradeParamsPayload;

// Mainnet tokens of the swap tab that need composite or buy-side pricing
const SWAP_FEEDS: OracleFeedMaps = {
  sell: { [STETH]: 'STETH_USD', [LDO]: 'LDO_USD', [WBTC]: 'WBTC_USD' },
  buy: { [USDC]: 'USDC_USD', [WSTETH]: 'STETH_USD', [LDO]: 'LDO_USD' },
};

const STETH_USDC_PRICES: Prices = {
  STETH_USD: round(usd(2000)),
  USDC_USD: round(usd(1)),
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Number(NOW_SEC) * 1000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('verifyWithOracle — inputs', () => {
  it('returns unavailable without client', async () => {
    expect(await verifyWithOracle(undefined, makePayload(), FEEDS)).toEqual(
      FAIL_UNAVAILABLE,
    );
  });

  it('returns unsupported when token address missing', async () => {
    const client = makeClient(STETH_USDC_PRICES);
    const result = await verifyWithOracle(
      client,
      makePayload({ sellToken: undefined }),
      FEEDS,
    );
    expect(result).toEqual(FAIL_UNSUPPORTED);
    expect(client.readContract).not.toHaveBeenCalled();
  });

  it('returns unsupported for token without feed', async () => {
    const client = makeClient(STETH_USDC_PRICES);
    expect(
      await verifyWithOracle(
        client,
        makePayload({ buyToken: { address: UNKNOWN } }),
        FEEDS,
      ),
    ).toEqual(FAIL_UNSUPPORTED);
    expect(
      await verifyWithOracle(
        client,
        makePayload({ sellToken: { address: USDC } }),
        FEEDS,
      ),
    ).toEqual(FAIL_UNSUPPORTED);
  });

  it('returns unsupported for token outside passed feed maps', async () => {
    const client = makeClient(STETH_USDC_PRICES);
    const result = await verifyWithOracle(client, makePayload(), {
      sell: FEEDS.sell,
      buy: {},
    });
    expect(result).toEqual(FAIL_UNSUPPORTED);
    expect(client.readContract).not.toHaveBeenCalled();
  });

  it('matches token addresses case-insensitively', async () => {
    const client = makeClient(STETH_USDC_PRICES);
    const result = await verifyWithOracle(
      client,
      makePayload({ sellToken: { address: c.lido.toUpperCase() } }),
      FEEDS,
    );
    expect(result.ok).toBe(true);
  });
});

describe('verifyWithOracle — deviation', () => {
  it('computes deviation minus partner fee for stETH → USDC', async () => {
    const result = await verifyWithOracle(
      makeClient(STETH_USDC_PRICES),
      makePayload(),
      FEEDS,
    );

    expect(result).toEqual({
      ok: true,
      sellTokenUsd: 2000,
      buyTokenUsd: 1,
      deviation: expect.any(Number),
    });
    // (2000 - 1990) / 2000 = 0.5%
    expect(result.ok && result.deviation).toBeCloseTo(0.5 - PARTNER_FEE_PCT);
  });

  it('reports negative deviation when user receives more than oracle price', async () => {
    const result = await verifyWithOracle(
      makeClient(STETH_USDC_PRICES),
      makePayload({ buyTokenAmount: { units: '2100' } }),
      FEEDS,
    );
    expect(result.ok && result.deviation).toBeLessThan(0);
  });

  it.each([
    ['ETH', ETH],
    ['WETH', WETH],
  ])('uses ETH/USD feed for %s', async (_, buyToken) => {
    const client = makeClient({
      STETH_USD: round(usd(2000)),
      ETH_USD: round(usd(2000)),
    });
    const result = await verifyWithOracle(
      client,
      makePayload({
        buyToken: { address: buyToken },
        buyTokenAmount: { units: '1' },
      }),
      FEEDS,
    );
    expect(result.ok && result.deviation).toBeCloseTo(-PARTNER_FEE_PCT);
  });

  it('converts wstETH price via stEthPerToken rate', async () => {
    const client = makeClient(STETH_USDC_PRICES, 1_200_000_000_000_000_000n);
    const result = await verifyWithOracle(
      client,
      makePayload({
        sellToken: { address: WSTETH },
        buyTokenAmount: { units: '2400' },
      }),
      FEEDS,
    );

    expect(result.ok && result.sellTokenUsd).toBeCloseTo(2400);
    expect(result.ok && result.deviation).toBeCloseTo(-PARTNER_FEE_PCT);
    expect(client.readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: WSTETH_ADDRESS,
        functionName: 'stEthPerToken',
      }),
    );
  });

  it('does not read wstETH rate for stETH', async () => {
    const client = makeClient(STETH_USDC_PRICES);
    await verifyWithOracle(client, makePayload(), FEEDS);
    expect(client.readContract).toHaveBeenCalledTimes(2);
  });

  it('converts wstETH buy price via stEthPerToken rate', async () => {
    const client = makeClient(
      { STETH_USD: round(usd(2000)) },
      1_200_000_000_000_000_000n,
    );
    const result = await verifyWithOracle(
      client,
      makePayload({
        buyToken: { address: WSTETH },
        buyTokenAmount: { units: '0.8' },
      }),
      SWAP_FEEDS,
    );

    expect(result.ok && result.buyTokenUsd).toBeCloseTo(2400);
    // 0.8 wstETH × 2400 = 1920 USD for 2000 USD of stETH = 4%
    expect(result.ok && result.deviation).toBeCloseTo(4 - PARTNER_FEE_PCT);
  });

  it('applies wstETH rate only to the wstETH side of stETH → wstETH', async () => {
    const client = makeClient(
      { STETH_USD: round(usd(2000)) },
      1_250_000_000_000_000_000n,
    );
    const result = await verifyWithOracle(
      client,
      makePayload({
        buyToken: { address: WSTETH },
        buyTokenAmount: { units: '0.8' },
      }),
      SWAP_FEEDS,
    );

    expect(result.ok && result.sellTokenUsd).toBeCloseTo(2000);
    expect(result.ok && result.buyTokenUsd).toBeCloseTo(2500);
    expect(result.ok && result.deviation).toBeCloseTo(-PARTNER_FEE_PCT);
  });

  it('prices LDO as LDO/ETH × ETH/USD', async () => {
    const client = makeClient({
      LDO_ETH: round(250_000_000_000_000n), // 0.00025 ETH, 18 decimals
      ETH_USD: round(usd(4000)),
      USDC_USD: round(usd(1)),
    });
    const result = await verifyWithOracle(
      client,
      makePayload({
        sellToken: { address: LDO },
        sellTokenAmount: { units: '1000' },
        buyTokenAmount: { units: '1000' },
      }),
      SWAP_FEEDS,
    );

    expect(result.ok && result.sellTokenUsd).toBeCloseTo(1);
    expect(result.ok && result.deviation).toBeCloseTo(-PARTNER_FEE_PCT);
  });

  it('prices WBTC as WBTC/BTC × BTC/USD', async () => {
    const client = makeClient({
      WBTC_BTC: round(usd(0.99)),
      BTC_USD: round(usd(100_000)),
      USDC_USD: round(usd(1)),
    });
    const result = await verifyWithOracle(
      client,
      makePayload({
        sellToken: { address: WBTC },
        buyTokenAmount: { units: '99000' },
      }),
      SWAP_FEEDS,
    );

    expect(result.ok && result.sellTokenUsd).toBeCloseTo(99_000);
    expect(result.ok && result.deviation).toBeCloseTo(-PARTNER_FEE_PCT);
  });
});

describe('readSellTokenUsd', () => {
  it('returns USD price of one sell token unit', async () => {
    expect(
      await readSellTokenUsd(
        makeClient({ STETH_USD: round(usd(2000)) }),
        makePayload(),
        FEEDS,
      ),
    ).toBeCloseTo(2000);
  });

  it('applies wstETH rate', async () => {
    expect(
      await readSellTokenUsd(
        makeClient({ STETH_USD: round(usd(2000)) }, 1_250_000_000_000_000_000n),
        makePayload({ sellToken: { address: WSTETH } }),
        FEEDS,
      ),
    ).toBeCloseTo(2500);
  });

  it('prices composite tokens', async () => {
    expect(
      await readSellTokenUsd(
        makeClient({
          LDO_ETH: round(250_000_000_000_000n),
          ETH_USD: round(usd(4000)),
        }),
        makePayload({ sellToken: { address: LDO } }),
        SWAP_FEEDS,
      ),
    ).toBeCloseTo(1);
  });

  it.each([
    ['no client', undefined, makePayload()],
    [
      'unknown token',
      makeClient(STETH_USDC_PRICES),
      makePayload({ sellToken: { address: UNKNOWN } }),
    ],
    [
      'stale round',
      makeClient({ STETH_USD: round(usd(2000), NOW_SEC - 10_000n) }),
      makePayload(),
    ],
    [
      'RPC error',
      makeClient({ STETH_USD: new Error('rpc down') }),
      makePayload(),
    ],
  ])('returns null for %s', async (_, client, payload) => {
    expect(await readSellTokenUsd(client, payload, FEEDS)).toBeNull();
  });
});

describe('oracle price config', () => {
  it.each(Object.entries(ORACLE_PRICES))(
    '%s uses known feeds with bounds',
    (_, feedKeys) => {
      expect(feedKeys.length).toBeGreaterThan(0);
      for (const key of feedKeys) {
        expect(CHAINLINK_FEEDS[key]).toBeDefined();
        expect(PRICE_BOUNDS[key]).toBeDefined();
      }
    },
  );
});

describe('verifyWithOracle — fail closed', () => {
  it('returns unavailable on RPC error', async () => {
    const client = makeClient({
      STETH_USD: new Error('rpc down'),
      USDC_USD: round(usd(1)),
    });
    expect(await verifyWithOracle(client, makePayload(), FEEDS)).toEqual(
      FAIL_UNAVAILABLE,
    );
  });

  it('returns unavailable for stale round', async () => {
    const stale = NOW_SEC - BigInt(CHAINLINK_FEEDS.STETH_USD.maxStaleness) - 1n;
    const client = makeClient({
      STETH_USD: round(usd(2000), stale),
      USDC_USD: round(usd(1)),
    });
    expect(await verifyWithOracle(client, makePayload(), FEEDS)).toEqual(
      FAIL_UNAVAILABLE,
    );
  });

  it('returns unavailable for price out of bounds', async () => {
    const client = makeClient({
      STETH_USD: round(usd(2000)),
      USDC_USD: round(usd(5)),
    });
    expect(await verifyWithOracle(client, makePayload(), FEEDS)).toEqual(
      FAIL_UNAVAILABLE,
    );
  });

  it.each([
    ['stale', 'LDO_ETH' as const],
    ['stale', 'ETH_USD' as const],
  ])('returns unavailable when composite part is %s (%s)', async (_, key) => {
    const stale = NOW_SEC - BigInt(CHAINLINK_FEEDS[key].maxStaleness) - 1n;
    const prices: Prices = {
      LDO_ETH: round(250_000_000_000_000n),
      ETH_USD: round(usd(4000)),
      USDC_USD: round(usd(1)),
    };
    const staleRound = prices[key] as RoundData;
    prices[key] = round(staleRound[1], stale);
    expect(
      await verifyWithOracle(
        makeClient(prices),
        makePayload({ sellToken: { address: LDO } }),
        SWAP_FEEDS,
      ),
    ).toEqual(FAIL_UNAVAILABLE);
  });

  it('returns unavailable when composite part is out of bounds', async () => {
    const client = makeClient({
      LDO_ETH: round(10n ** 17n), // 0.1 ETH, above max
      ETH_USD: round(usd(4000)),
      USDC_USD: round(usd(1)),
    });
    expect(
      await verifyWithOracle(
        client,
        makePayload({ sellToken: { address: LDO } }),
        SWAP_FEEDS,
      ),
    ).toEqual(FAIL_UNAVAILABLE);
  });

  it('returns unavailable for wstETH buy rate out of range', async () => {
    const client = makeClient(
      { STETH_USD: round(usd(2000)) },
      2_000_000_000_000_000_001n,
    );
    expect(
      await verifyWithOracle(
        client,
        makePayload({ buyToken: { address: WSTETH } }),
        SWAP_FEEDS,
      ),
    ).toEqual(FAIL_UNAVAILABLE);
  });

  it.each([
    ['below 1.0', 999_999_999_999_999_999n],
    ['above 2.0', 2_000_000_000_000_000_001n],
  ])('returns unavailable for wstETH rate %s', async (_, rate) => {
    const client = makeClient(STETH_USDC_PRICES, rate);
    expect(
      await verifyWithOracle(
        client,
        makePayload({ sellToken: { address: WSTETH } }),
        FEEDS,
      ),
    ).toEqual(FAIL_UNAVAILABLE);
  });

  it.each([
    ['zero sell', { sellTokenAmount: { units: '0' } }],
    ['negative buy', { buyTokenAmount: { units: '-1' } }],
    ['invalid sell', { sellTokenAmount: { units: 'abc' } }],
    ['missing buy', { buyTokenAmount: undefined }],
  ])('returns unavailable for %s amount', async (_, overrides) => {
    expect(
      await verifyWithOracle(
        makeClient(STETH_USDC_PRICES),
        makePayload(overrides),
        FEEDS,
      ),
    ).toEqual(FAIL_UNAVAILABLE);
  });

  it('uses Chainlink 8-decimals scale', () => {
    expect(CHAINLINK_SCALE).toBe(10n ** 8n);
  });
});
