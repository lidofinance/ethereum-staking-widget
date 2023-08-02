import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { CACHE_LIDO_STATS_KEY, CACHE_LIDO_STATS_TTL, API_ROUTES } from 'config';
import {
  getLidoStats,
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LIDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns steth token information
// Mirror of /api/lido-stats
// DEPRECATED: In future will be delete!!!
const lidoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(CACHE_LIDO_STATS_KEY);

  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const lidoStats = await getLidoStats();
    cache.put(CACHE_LIDO_STATS_KEY, { data: lidoStats }, CACHE_LIDO_STATS_TTL);

    res.status(200).json({ data: lidoStats });
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.LIDOSTATS),
  ...errorAndCacheDefaultWrappers,
])(lidoStats);
