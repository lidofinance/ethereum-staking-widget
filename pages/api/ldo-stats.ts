import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';

import { API_ROUTES } from 'consts/api';
import {
  getLdoStats,
  errorAndCacheDefaultWrappers,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof config.CACHE_LDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns LDO token information
// DEPRECATED: In future will be delete!!!
const ldoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(config.CACHE_LDO_STATS_KEY);

  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const ldoStats = await getLdoStats();

    cache.put(
      config.CACHE_LDO_STATS_KEY,
      { data: ldoStats },
      config.CACHE_LDO_STATS_TTL,
    );

    res.status(200).json({ data: ldoStats });
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.LDO_STATS),
  ...errorAndCacheDefaultWrappers,
])(ldoStats);
