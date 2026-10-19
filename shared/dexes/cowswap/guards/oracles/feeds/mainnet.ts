import type { Address } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import type { ChainlinkFeedConfig } from '../types';

// --- Resolve mainnet addresses from network config ---

const c = mainnetConfig.contracts;

// TODO; move maxStaleness to consts

// --- Chainlink Price Feeds (Mainnet) ---

export type ChainlinkFeedKey =
  | 'ETH_USD'
  | 'STETH_USD'
  | 'USDC_USD'
  | 'USDT_USD'
  | 'DAI_USD'
  | 'BTC_USD'
  | 'USDE_USD'
  | 'USDS_USD'
  | 'PYUSD_USD'
  | 'CBBTC_USD'
  | 'LDO_ETH'
  | 'WBTC_BTC';

export const CHAINLINK_FEEDS: Record<ChainlinkFeedKey, ChainlinkFeedConfig> = {
  ETH_USD: {
    address: c.aggregatorEthUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h + 5min buffer
    decimals: 8,
  },
  STETH_USD: {
    address: c.aggregatorStEthUsdPriceFeed as Address,
    maxStaleness: 3900,
    decimals: 8,
  },
  USDC_USD: {
    address: c.aggregatorUsdcUsdPriceFeed as Address,
    maxStaleness: 87000, // 24h + 10min buffer
    decimals: 8,
  },
  USDT_USD: {
    address: c.aggregatorUsdtUsdPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
  DAI_USD: {
    address: c.aggregatorDaiUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h, used as proxy for USDS in withdrawals
    decimals: 8,
  },
  BTC_USD: {
    address: c.aggregatorBtcUsdPriceFeed as Address,
    maxStaleness: 3900, // 1h
    decimals: 8,
  },
  USDE_USD: {
    address: c.aggregatorUsdeUsdPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
  USDS_USD: {
    address: c.aggregatorUsdsUsdPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
  PYUSD_USD: {
    address: c.aggregatorPyusdUsdPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
  CBBTC_USD: {
    address: c.aggregatorCbbtcUsdPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
  LDO_ETH: {
    address: c.aggregatorLdoEthPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 18,
  },
  WBTC_BTC: {
    address: c.aggregatorWbtcBtcPriceFeed as Address,
    maxStaleness: 87000,
    decimals: 8,
  },
};

// Token USD price as a product of feeds, e.g. LDO/ETH × ETH/USD
export type OraclePriceKey =
  Exclude<ChainlinkFeedKey, 'LDO_ETH' | 'WBTC_BTC'> | 'LDO_USD' | 'WBTC_USD';

export const ORACLE_PRICES: Record<
  OraclePriceKey,
  readonly ChainlinkFeedKey[]
> = {
  ETH_USD: ['ETH_USD'],
  STETH_USD: ['STETH_USD'],
  USDC_USD: ['USDC_USD'],
  USDT_USD: ['USDT_USD'],
  DAI_USD: ['DAI_USD'],
  BTC_USD: ['BTC_USD'],
  USDE_USD: ['USDE_USD'],
  USDS_USD: ['USDS_USD'],
  PYUSD_USD: ['PYUSD_USD'],
  CBBTC_USD: ['CBBTC_USD'],
  LDO_USD: ['LDO_ETH', 'ETH_USD'],
  WBTC_USD: ['WBTC_BTC', 'BTC_USD'],
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

// Per-feed price sanity bounds, in feed decimals
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
  USDE_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  USDS_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  PYUSD_USD: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
  CBBTC_USD: {
    min: 30_000n * CHAINLINK_SCALE,
    max: 200_000n * CHAINLINK_SCALE,
  },
  // 18 decimals: 0.00001–0.01 ETH
  LDO_ETH: { min: 10n ** 13n, max: 10n ** 16n },
  WBTC_BTC: { min: CHAINLINK_SCALE / 2n, max: 2n * CHAINLINK_SCALE },
};
