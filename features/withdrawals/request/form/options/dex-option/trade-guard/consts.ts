import type { Address } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import { MAX_SLIPPAGE, PARTNER_FEE_BPS } from '../consts';

import type { ChainlinkFeedConfig } from './types';

// Partner fee as a percentage (0.3%) — subtracted from deviation calculations
// because it's a known fixed cost the user has agreed to, not an unexpected loss
export const PARTNER_FEE_PCT = PARTNER_FEE_BPS / 100;

// --- Thresholds ---

export type Thresholds = {
  fiatDeviationBlock: number;
  oracleDeviationBlock: number;
  minReceiveRatioThreshold: number;
  slippageCheckMinFiat: number;
  maxAllowedSellAmount: number;
  minSellUnitsToTriggerOracle: number;
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  fiatDeviationBlock: 4,
  oracleDeviationBlock: 4,
  // CowSwap's minimumReceiveBuyAmount includes slippage + partner fee,
  // so the threshold must account for both to avoid false positives
  minReceiveRatioThreshold: 1 - (MAX_SLIPPAGE + PARTNER_FEE_BPS) / 10_000,
  // Minimum sell fiat ($) for slippage ratio check — below this fixed
  // network costs (~$0.10-0.20) dominate and cause false positives
  slippageCheckMinFiat: 50,
  //
  maxAllowedSellAmount: 5_000,
  // Minimum sell amount (in token units) to trigger Chainlink oracle verification
  minSellUnitsToTriggerOracle: 1,
};

// --- Resolve mainnet addresses from network config ---

const c = mainnetConfig.contracts;

// --- Valid token addresses (mainnet, lowercased) ---

// CowSwap native ETH placeholder — not a real contract, no entry in network config
const ETH_PLACEHOLDER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const VALID_SELL_TOKENS = new Set<string>([
  c.lido.toLowerCase(), // stETH
  c.wsteth.toLowerCase(), // wstETH
]);

export const VALID_BUY_TOKENS = new Set<string>([
  ETH_PLACEHOLDER,
  c.weth.toLowerCase(),
  c.usdc.toLowerCase(),
  c.usdt.toLowerCase(),
  c.usds.toLowerCase(),
  c.wbtc.toLowerCase(),
]);

// --- Chainlink Price Feeds (Mainnet) ---

// All feeds return USD price with 8 decimals unless noted
export const CHAINLINK_FEEDS: Record<string, ChainlinkFeedConfig> = {
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

// Map buy token address → Chainlink feed key for USD price
export const BUY_TOKEN_FEED_MAP: Record<string, string> = {
  [ETH_PLACEHOLDER]: 'ETH_USD',
  [c.weth.toLowerCase()]: 'ETH_USD',
  [c.usdc.toLowerCase()]: 'USDC_USD',
  [c.usdt.toLowerCase()]: 'USDT_USD',
  [c.usds.toLowerCase()]: 'DAI_USD', // USDS → DAI proxy
  [c.wbtc.toLowerCase()]: 'BTC_USD',
};

// Sell token address → Chainlink feed key for USD price
export const SELL_TOKEN_FEED_MAP: Record<string, string> = {
  [c.lido.toLowerCase()]: 'STETH_USD',
  [c.wsteth.toLowerCase()]: 'STETH_USD', // wstETH → needs rate conversion
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
