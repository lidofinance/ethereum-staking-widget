import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';

import mainnetNetwork from 'networks/mainnet.json';

import {
  CHAINLINK_FEEDS,
  ORACLE_PRICES,
  type OraclePriceKey,
} from '../../feeds';
import type { OnTradeParamsPayload } from '../../types';
import {
  readNetworkCostAllowance,
  type NetworkCostClient,
} from '../network-cost';
import { TEST_PROFILE } from '../../../tx/__tests__/fixtures';
import type { RoundData } from '../rounds';

const c = mainnetNetwork.contracts;
const USDC = c.usdc.toLowerCase();
const STETH = c.lido.toLowerCase();
const WETH = c.weth.toLowerCase();
const UNKNOWN = '0x0000000000000000000000000000000000000001';

const FEEDS = TEST_PROFILE.oracleFeeds;
const NOW_SEC = 1_700_000_000n;
const GWEI = 1_000_000_000n;

const MAINNET = { isMainnet: true, isTestnet: false };
const L2 = { isMainnet: false, isTestnet: false };
const TESTNET = { isMainnet: false, isTestnet: true };

const round = (usd: number, updatedAt = NOW_SEC - 60n): RoundData => [
  10n,
  BigInt(Math.round(usd * 1e8)),
  updatedAt,
  updatedAt,
  10n,
];

type Prices = Partial<Record<OraclePriceKey, RoundData | Error>>;

// feeds by Chainlink address; the gas price is a wei bigint or an error
const makeClient = (prices: Prices, gasPrice: bigint | Error = 3n * GWEI) => {
  const byAddress = new Map<string, RoundData | Error>();
  for (const [priceKey, value] of Object.entries(prices)) {
    for (const feedKey of ORACLE_PRICES[priceKey as OraclePriceKey]) {
      byAddress.set(CHAINLINK_FEEDS[feedKey].address.toLowerCase(), value);
    }
  }
  const readContract = vi.fn(async ({ address }: { address: Address }) => {
    const value = byAddress.get(address.toLowerCase());
    if (value === undefined) throw new Error(`no mock for ${address}`);
    if (value instanceof Error) throw value;
    return value;
  });
  const getGasPrice = vi.fn(async () => {
    if (gasPrice instanceof Error) throw gasPrice;
    return gasPrice;
  });
  return { readContract, getGasPrice } as unknown as NetworkCostClient & {
    readContract: typeof readContract;
    getGasPrice: typeof getGasPrice;
  };
};

const payload = (buyAddress: string, buyUnits: string): OnTradeParamsPayload =>
  ({
    sellToken: { address: STETH, symbol: 'stETH' },
    buyToken: { address: buyAddress, symbol: 'X' },
    sellTokenAmount: { units: '1' },
    buyTokenAmount: { units: buyUnits },
  }) as unknown as OnTradeParamsPayload;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Number(NOW_SEC) * 1000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('readNetworkCostAllowance', () => {
  // 3 gwei × 1.5M gas × 3 = 0.0135 ETH = $27 at $2000
  const prices: Prices = { ETH_USD: round(2000), USDC_USD: round(1) };

  it('mainnet: gas estimate from our gas price, in buy token units', async () => {
    const client = makeClient(prices);
    expect(
      await readNetworkCostAllowance(
        client,
        payload(USDC, '10000'),
        FEEDS,
        MAINNET,
      ),
    ).toBeCloseTo(27, 6);
    expect(client.getGasPrice).toHaveBeenCalledTimes(1);
  });

  it('mainnet: capped by the share of the quote on small trades', async () => {
    const client = makeClient(prices);
    expect(
      await readNetworkCostAllowance(
        client,
        payload(USDC, '4'),
        FEEDS,
        MAINNET,
      ),
    ).toBeCloseTo(0.2, 9);
  });

  it('mainnet: capped in USD during a gas spike', async () => {
    const client = makeClient(prices, 50n * GWEI);
    expect(
      await readNetworkCostAllowance(
        client,
        payload(USDC, '1000000'),
        FEEDS,
        MAINNET,
      ),
    ).toBeCloseTo(100, 6);
  });

  it('prices the allowance in the buy token', async () => {
    const client = makeClient(prices);
    // $27 of WETH at $2000
    expect(
      await readNetworkCostAllowance(
        client,
        payload(WETH, '100'),
        FEEDS,
        MAINNET,
      ),
    ).toBeCloseTo(0.0135, 9);
  });

  it('L2: static share and USD cap, no gas price read', async () => {
    const client = makeClient(prices);
    expect(
      await readNetworkCostAllowance(client, payload(USDC, '100'), FEEDS, L2),
    ).toBeCloseTo(0.5, 9);
    expect(
      await readNetworkCostAllowance(client, payload(USDC, '1000'), FEEDS, L2),
    ).toBeCloseTo(1, 9);
    expect(client.getGasPrice).not.toHaveBeenCalled();
  });

  it('testnet: share of the quote without any read', async () => {
    const client = makeClient({});
    expect(
      await readNetworkCostAllowance(
        client,
        payload(USDC, '100'),
        FEEDS,
        TESTNET,
      ),
    ).toBeCloseTo(5, 9);
    expect(client.readContract).not.toHaveBeenCalled();
  });

  it.each([
    ['no client', undefined, payload(USDC, '100')],
    ['unknown buy token', makeClient(prices), payload(UNKNOWN, '100')],
    ['unparseable quote', makeClient(prices), payload(USDC, 'abc')],
    ['zero quote', makeClient(prices), payload(USDC, '0')],
    [
      'stale ETH price',
      makeClient({ ...prices, ETH_USD: round(2000, NOW_SEC - 100_000n) }),
      payload(USDC, '100'),
    ],
    [
      'feed error',
      makeClient({ ...prices, USDC_USD: new Error('rpc') }),
      payload(USDC, '100'),
    ],
    [
      'gas price error',
      makeClient(prices, new Error('rpc')),
      payload(USDC, '100'),
    ],
  ])('returns 0 on %s', async (_, client, params) => {
    expect(await readNetworkCostAllowance(client, params, FEEDS, MAINNET)).toBe(
      0,
    );
  });
});
