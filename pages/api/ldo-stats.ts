import { Cache } from 'memory-cache';
import { CACHE_LDO_STATS_KEY, CACHE_LDO_STATS_TTL } from 'config';
import { getLdoStats, defaultErrorAndCacheWrapper } from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns LDO token information
// DEPRECATED: In future will be delete!!!
const ldoStats: API = async (req, res) => {
  const cachedLidoStats = cache.get(CACHE_LDO_STATS_KEY);

  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const ldoStats = await getLdoStats();
    cache.put(CACHE_LDO_STATS_KEY, { data: ldoStats }, CACHE_LDO_STATS_TTL);

    res.status(200).json({ data: ldoStats });
  }
};

export default defaultErrorAndCacheWrapper(ldoStats);
