import { Cache } from 'memory-cache';
import {
  CACHE_LIDO_STATS_KEY,
  CACHE_LIDO_STATS_TTL,
  CACHE_DEFAULT_HEADERS,
  CACHE_DEFAULT_ERROR_HEADERS,
} from 'config';
import {
  getLidoStats,
  wrapRequest,
  defaultErrorHandler,
  cacheControl,
  errorCacheControl,
} from 'utilsApi';
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

export default wrapRequest(lidoStats, [
  cacheControl(CACHE_DEFAULT_HEADERS),
  errorCacheControl(CACHE_DEFAULT_ERROR_HEADERS),
  defaultErrorHandler,
]);
