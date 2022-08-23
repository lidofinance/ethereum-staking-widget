import ms from 'ms';

export const CACHE_STETH_APR_KEY = 'cache-steth-apr';
export const CACHE_STETH_APR_TTL = ms('1h');

export const CACHE_ETH_APR_KEY = 'cache-eth-apr';
export const CACHE_ETH_APR_TTL = ms('1h');

export const CACHE_LIDO_STATS_KEY = 'cache-lido-stats';
export const CACHE_LIDO_STATS_TTL = ms('1h');

export const CACHE_LIDO_SHORT_STATS_KEY = 'cache-short-lido-stats';
export const CACHE_LIDO_SHORT_STATS_TTL = ms('1h');

export const CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_KEY =
  'cache-lido-holders-via-subgraphs';
export const CACHE_LIDO_HOLDERS_VIA_SUBGRAPHS_TTL = ms('7d');

export const CACHE_LDO_STATS_KEY = 'cache-ldo-stats';
export const CACHE_LDO_STATS_TTL = ms('1h');

export const CACHE_ETH_PRICE_KEY = 'cache-eth-price';
export const CACHE_ETH_PRICE_TTL = ms('1m');

export const CACHE_ONE_INCH_RATE_KEY = 'oneinch-rate';
export const CACHE_ONE_INCH_RATE_TTL = ms('1h');

export const CACHE_TOTAL_SUPPLY_KEY = 'cache-total-supply';
export const CACHE_TOTAL_SUPPLY_TTL = ms('1m');

export const CACHE_DEFAULT_HEADERS =
  'public, max-age=180, stale-if-error=1200, stale-while-revalidate=60';
export const CACHE_WHITELIST_PATHS: { [path: string]: string } = {
  '/api/lido-stats': CACHE_DEFAULT_HEADERS,
  '/api/lidostats': CACHE_DEFAULT_HEADERS,
  '/api/short-lido-stats': CACHE_DEFAULT_HEADERS,
  '/api/steth-apr': CACHE_DEFAULT_HEADERS,
  '/api/eth-apr': CACHE_DEFAULT_HEADERS,
  '/api/apr': CACHE_DEFAULT_HEADERS,
  '/api/oneinch-rate': CACHE_DEFAULT_HEADERS,
  '/api/csp-report': CACHE_DEFAULT_HEADERS,
  '/favicon-?[^@]*.(svg|ico)': CACHE_DEFAULT_HEADERS,
  '/manifest.json': CACHE_DEFAULT_HEADERS,
};
