import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { API_DEFAULT_SUNSET_TIMESTAMP, API_ROUTES } from 'consts/api';
import {
  getLidoStats,
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  sunsetBy,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof config.CACHE_LIDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns steth token information
// Mirror of /api/lido-stats
// DEPRECATED: In future will be delete!!!
const lidoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(config.CACHE_LIDO_STATS_KEY);

  if (cachedLidoStats) {
    res.json(cachedLidoStats);
  } else {
    const lidoStats = await getLidoStats();
    cache.put(
      config.CACHE_LIDO_STATS_KEY,
      { data: lidoStats },
      config.CACHE_LIDO_STATS_TTL,
    );

    res.json({ data: lidoStats });
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.LIDOSTATS),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
  }),
  ...errorAndCacheDefaultWrappers,
])(lidoStats);
