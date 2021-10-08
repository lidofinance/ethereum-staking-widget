import { Cache } from 'memory-cache';
import {
  CACHE_LDO_STATS_KEY,
  CACHE_LDO_STATS_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getLdoStats } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LDO_STATS_KEY, Response>();

// Proxy for third-party API.
// Returns LDO token information
const ldoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LDO_STATS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const lidoStats = await getLdoStats();
      cache.put(CACHE_LDO_STATS_KEY, lidoStats, CACHE_LDO_STATS_TTL);

      res.status(200).json(lidoStats);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default ldoStats;
