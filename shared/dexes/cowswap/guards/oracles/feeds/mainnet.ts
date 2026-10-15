import type { Address } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import type { ChainlinkFeedConfig } from '../types';

// --- Resolve mainnet addresses from network config ---

const c = mainnetConfig.contracts;

// --- Chainlink Price Feeds (Mainnet) ---

export type ChainlinkFeedKey =
  'ETH_USD' | 'STETH_USD' | 'USDC_USD' | 'USDT_USD' | 'DAI_USD' | 'BTC_USD';

// All feeds return USD price with 8 decimals unless noted
export const CHAINLINK_FEEDS: Record<ChainlinkFeedKey, ChainlinkFeedConfig> = {
  ETH_USD: {
    address: c.aggregatorEthUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h + 5min buffer
  },
  STETH_USD: {
    address: c.aggregatorStEthUsdPriceFeed as Address,
    maxStaleness: 3900,
  },
  USDC_USD: {
    address: c.aggregatorUsdcUsdPriceFeed as Address,
    maxStaleness: 87000, // 24h + 10min buffer
  },
  USDT_USD: {
    address: c.aggregatorUsdtUsdPriceFeed as Address,
    maxStaleness: 87000,
  },
  DAI_USD: {
    address: c.aggregatorDaiUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h, used as proxy for USDS
  },
  BTC_USD: {
    address: c.aggregatorBtcUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h, used for WBTC pricing
  },
};

// wstETH address for detecting when extra conversion is needed
export const WSTETH_ADDRESS = c.wsteth.toLowerCase() as Address;

//
// ---------------------------------------------------------------------------
// Oracle constants
// ---------------------------------------------------------------------------

// Chainlink scale (8 decimals)
export const CHAINLINK_SCALE = 10n ** 8n;
// wstETH scale (18 decimals)
export const WSTETH_SCALE = 10n ** 18n;
// wstETH rate minimum (18 decimals)
export const WSTETH_RATE_MIN = 10n ** 18n;
// wstETH rate maximum (18 decimals)
export const WSTETH_RATE_MAX = 2n * 10n ** 18n; // 2.0 — ~14 years runway at 5% APR

// Per-feed price sanity bounds (8 decimals)
export const PRICE_BOUNDS: Record<string, { min: bigint; max: bigint }> = {
  ETH_USD: { min: 1000n * CHAINLINK_SCALE, max: 20_000n * CHAINLINK_SCALE },
  STETH_USD: { min: 1000n * CHAINLINK_SCALE, max: 20_000n * CHAINLINK_SCALE },
  USDC_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  USDT_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  DAI_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  BTC_USD: {
    min: 30_000n * CHAINLINK_SCALE,
    max: 200_000n * CHAINLINK_SCALE,
  },
};
