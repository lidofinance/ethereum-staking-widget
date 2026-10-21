import type { Address } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import type { ChainlinkFeedConfig } from '../types';

// --- Resolve mainnet addresses from network config ---

const c = mainnetConfig.contracts as Record<
  keyof typeof mainnetConfig.contracts,
  Address
>;

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
  | 'WBTC_BTC'
  | 'LINK_USD'
  | 'UNI_USD'
  | 'AAVE_USD'
  | 'RLUSD_USD'
  | 'USDG_USD'
  | 'AUSD_USD'
  | 'EURC_USD'
  | 'GHO_USD'
  | 'PAXG_USD'
  | 'TBTC_USD'
  | 'LBTC_BTC'
  | 'CBETH_ETH'
  | 'SUSDE_USD';

export const CHAINLINK_FEEDS: Record<ChainlinkFeedKey, ChainlinkFeedConfig> = {
  ETH_USD: {
    address: c.aggregatorEthUsdPriceFeed,
    maxStaleness: 3900, // 1h + 5min buffer
    decimals: 8,
  },
  STETH_USD: {
    address: c.aggregatorStEthUsdPriceFeed,
    maxStaleness: 3900,
    decimals: 8,
  },
  USDC_USD: {
    address: c.aggregatorUsdcUsdPriceFeed,
    maxStaleness: 87000, // 24h + 10min buffer
    decimals: 8,
  },
  USDT_USD: {
    address: c.aggregatorUsdtUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  DAI_USD: {
    address: c.aggregatorDaiUsdPriceFeed,
    maxStaleness: 3900, // 1h, used as proxy for USDS in withdrawals
    decimals: 8,
  },
  BTC_USD: {
    address: c.aggregatorBtcUsdPriceFeed,
    maxStaleness: 3900, // 1h
    decimals: 8,
  },
  USDE_USD: {
    address: c.aggregatorUsdeUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  USDS_USD: {
    address: c.aggregatorUsdsUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  PYUSD_USD: {
    address: c.aggregatorPyusdUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  CBBTC_USD: {
    address: c.aggregatorCbbtcUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  LDO_ETH: {
    address: c.aggregatorLdoEthPriceFeed,
    maxStaleness: 87000,
    decimals: 18,
  },
  WBTC_BTC: {
    address: c.aggregatorWbtcBtcPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  LINK_USD: {
    address: c.aggregatorLinkUsdPriceFeed,
    maxStaleness: 3900,
    decimals: 8,
  },
  UNI_USD: {
    address: c.aggregatorUniUsdPriceFeed,
    maxStaleness: 3900,
    decimals: 8,
  },
  AAVE_USD: {
    address: c.aggregatorAaveUsdPriceFeed,
    maxStaleness: 3900,
    decimals: 8,
  },
  RLUSD_USD: {
    address: c.aggregatorRlusdUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  USDG_USD: {
    address: c.aggregatorUsdgUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  AUSD_USD: {
    address: c.aggregatorAusdUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 18,
  },
  EURC_USD: {
    address: c.aggregatorEurcUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  GHO_USD: {
    address: c.aggregatorGhoUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  PAXG_USD: {
    address: c.aggregatorPaxgUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  TBTC_USD: {
    address: c.aggregatorTbtcUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  LBTC_BTC: {
    address: c.aggregatorLbtcBtcPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
  CBETH_ETH: {
    address: c.aggregatorCbethEthPriceFeed,
    maxStaleness: 87000,
    decimals: 18,
  },
  SUSDE_USD: {
    address: c.aggregatorSusdeUsdPriceFeed,
    maxStaleness: 87000,
    decimals: 8,
  },
};

// Token USD price as a product of feeds, e.g. LDO/ETH × ETH/USD
export type OraclePriceKey =
  | Exclude<ChainlinkFeedKey, 'LDO_ETH' | 'WBTC_BTC' | 'LBTC_BTC' | 'CBETH_ETH'>
  | 'WSTETH_USD'
  | 'LDO_USD'
  | 'WBTC_USD'
  | 'LBTC_USD'
  | 'CBETH_USD';

export const ORACLE_PRICES: Record<
  OraclePriceKey,
  readonly ChainlinkFeedKey[]
> = {
  ETH_USD: ['ETH_USD'],
  STETH_USD: ['STETH_USD'],
  // × stEthPerToken of mainnet wstETH, see WSTETH_PRICE_KEY
  WSTETH_USD: ['STETH_USD'],
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
  LINK_USD: ['LINK_USD'],
  UNI_USD: ['UNI_USD'],
  AAVE_USD: ['AAVE_USD'],
  RLUSD_USD: ['RLUSD_USD'],
  USDG_USD: ['USDG_USD'],
  AUSD_USD: ['AUSD_USD'],
  EURC_USD: ['EURC_USD'],
  GHO_USD: ['GHO_USD'],
  PAXG_USD: ['PAXG_USD'],
  TBTC_USD: ['TBTC_USD'],
  LBTC_USD: ['LBTC_BTC', 'BTC_USD'],
  CBETH_USD: ['CBETH_ETH', 'ETH_USD'],
  SUSDE_USD: ['SUSDE_USD'],
};

// Price key that applies the wstETH rate, on any network
export const WSTETH_PRICE_KEY: OraclePriceKey = 'WSTETH_USD';
// Mainnet wstETH, source of stEthPerToken for every network
export const WSTETH_ADDRESS = c.wsteth.toLowerCase() as Address;

//
// ---------------------------------------------------------------------------
// Oracle constants
// ---------------------------------------------------------------------------

// Chainlink scale (8 decimals)
export const CHAINLINK_SCALE = 10n ** 8n;
// 0.5 and 2 in Chainlink scale, bounds for pegged prices
export const CHAINLINK_SCALE_MIN = CHAINLINK_SCALE / 2n;
export const CHAINLINK_SCALE_MAX = CHAINLINK_SCALE * 2n;
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
  USDC_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  USDT_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  DAI_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  BTC_USD: {
    min: 30_000n * CHAINLINK_SCALE,
    max: 200_000n * CHAINLINK_SCALE,
  },
  USDE_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  USDS_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  PYUSD_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  CBBTC_USD: {
    min: 30_000n * CHAINLINK_SCALE,
    max: 200_000n * CHAINLINK_SCALE,
  },
  // 18 decimals: 0.00001–0.01 ETH
  LDO_ETH: { min: 10n ** 13n, max: 10n ** 16n },
  WBTC_BTC: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  LINK_USD: { min: CHAINLINK_SCALE, max: 200n * CHAINLINK_SCALE },
  UNI_USD: { min: CHAINLINK_SCALE_MIN, max: 100n * CHAINLINK_SCALE },
  AAVE_USD: { min: 10n * CHAINLINK_SCALE, max: 2_000n * CHAINLINK_SCALE },
  RLUSD_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  USDG_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  // 18 decimals: 0.5–2 USD
  AUSD_USD: { min: 5n * 10n ** 17n, max: 2n * 10n ** 18n },
  // EUR, not USD
  EURC_USD: {
    min: (CHAINLINK_SCALE * 8n) / 10n,
    max: (CHAINLINK_SCALE * 16n) / 10n,
  },
  GHO_USD: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  // one troy ounce of gold
  PAXG_USD: { min: 1000n * CHAINLINK_SCALE, max: 20_000n * CHAINLINK_SCALE },
  TBTC_USD: {
    min: 30_000n * CHAINLINK_SCALE,
    max: 200_000n * CHAINLINK_SCALE,
  },
  LBTC_BTC: { min: CHAINLINK_SCALE_MIN, max: CHAINLINK_SCALE_MAX },
  // 18 decimals: 1–2 ETH, the rate only grows
  CBETH_ETH: { min: 10n ** 18n, max: 2n * 10n ** 18n },
  // value-accruing, ≈ 1.25 USD now
  SUSDE_USD: { min: CHAINLINK_SCALE_MIN, max: 3n * CHAINLINK_SCALE },
};
