const duration1Minute = 1000 * 60;
const duration1Hour = duration1Minute * 60;
const duration1day = duration1Hour * 24;
const duration1week = duration1day * 7;

export const CACHE_STETH_APR_KEY = 'cache-steth-apr';
export const CACHE_STETH_APR_TTL = duration1Hour;

export const CACHE_ETH_APR_KEY = 'cache-eth-apr';
export const CACHE_ETH_APR_TTL = duration1Hour;

export const CACHE_LIDO_STATS_KEY = 'cache-lido-stats';
export const CACHE_LIDO_STATS_TTL = duration1Hour;

export const CACHE_LIDO_SHORT_STATS_KEY = 'cache-short-lido-stats';
export const CACHE_LIDO_SHORT_STATS_TTL = duration1Hour;

export const CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY =
  'cache-lido-holders-via-subgraphs';
export const CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL = duration1week;

export const CACHE_LDO_STATS_KEY = 'cache-ldo-stats';
export const CACHE_LDO_STATS_TTL = duration1Hour;

export const CACHE_ETH_PRICE_KEY = 'cache-eth-price';
export const CACHE_ETH_PRICE_TTL = duration1Minute;

export const CACHE_ONE_INCH_RATE_KEY = 'oneinch-rate';
export const CACHE_ONE_INCH_RATE_TTL = duration1Hour;

export const CACHE_TOTAL_SUPPLY_KEY = 'cache-total-supply';
export const CACHE_TOTAL_SUPPLY_TTL = duration1Minute;
