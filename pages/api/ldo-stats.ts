import { Cache } from 'memory-cache';
import { CACHE_LDO_STATS_KEY, CACHE_LDO_STATS_TTL } from 'config';
import { getLdoStats, serverErrorHandler } from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns LDO token information
// DEPRECATED: In future will be delete!!!
const ldoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LDO_STATS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const ldoStats = await getLdoStats();
      cache.put(CACHE_LDO_STATS_KEY, { data: ldoStats }, CACHE_LDO_STATS_TTL);

      res.status(200).json({ data: ldoStats });
    }
  } catch (error) {
    serverErrorHandler(error, res);
  }
};

export default ldoStats;
