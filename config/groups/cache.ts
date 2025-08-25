import ms from 'ms';

export const CACHE_STETH_APR_TTL = ms('1h');
export const CACHE_SMA_STETH_APR_TTL = ms('30m');
export const CACHE_ETH_APR_TTL = ms('1h');

export const CACHE_LIDO_STATS_KEY = 'cache-lido-stats';
export const CACHE_LIDO_STATS_TTL = ms('1h');
export const CACHE_LIDO_SHORT_STATS_TTL = ms('1h');
export const CACHE_LDO_STATS_TTL = ms('1h');
export const CACHE_LDO_STATS_KEY = 'cache-ldo-stats';
export const CACHE_ETH_PRICE_TTL = ms('1m');

export const CACHE_ETH_PRICE_HEADERS =
  'public, max-age=60, stale-if-error=1200, stale-while-revalidate=30';

export const CACHE_ONE_INCH_RATE_KEY = 'oneinch-rate';
export const CACHE_ONE_INCH_RATE_TTL = ms('5m');

export const CACHE_TOTAL_SUPPLY_KEY = 'cache-total-supply';
export const CACHE_TOTAL_SUPPLY_TTL = ms('1m');

export const CACHE_EXTERNAL_CONFIG_KEY = 'cache-external-config';
export const CACHE_EXTERNAL_CONFIG_TTL = ms('10m');

export const CACHE_TOTAL_SUPPLY_HEADERS =
  'public, max-age=60, stale-if-error=1200, stale-while-revalidate=30';

export const CACHE_DEFAULT_HEADERS =
  'public, max-age=180, stale-if-error=1200, stale-while-revalidate=60';
export const CACHE_REWARDS_HEADERS =
  'public, max-age=30, stale-if-error=1200, stale-while-revalidate=30';
export const CACHE_VALIDATION_HEADERS =
  'public, max-age=30, stale-if-error=1200, stale-while-revalidate=30';
export const CACHE_DEFAULT_ERROR_HEADERS = 'no-store, must-revalidate';
