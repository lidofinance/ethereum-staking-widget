import { Cache } from 'memory-cache';
import { CACHE_LIDO_STATS_KEY, CACHE_LIDO_STATS_TTL } from 'config';
import {
  getLidoStats,
  defaultErrorAndCacheWrapper,
  responseTimeExternalMetricWrapper,
} from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LIDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns steth token information
// DEPRECATED: In future will be delete!!!
const lidoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(CACHE_LIDO_STATS_KEY);

  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const lidoStats = await responseTimeExternalMetricWrapper(getLidoStats)(
      req,
      res,
    );
    cache.put(CACHE_LIDO_STATS_KEY, { data: lidoStats }, CACHE_LIDO_STATS_TTL);

    res.status(200).json({ data: lidoStats });
  }
};

export default defaultErrorAndCacheWrapper(lidoStats);
