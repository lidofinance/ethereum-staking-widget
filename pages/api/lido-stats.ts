import { Cache } from 'memory-cache';
import {
  CACHE_LIDO_STATS_KEY,
  CACHE_LIDO_STATS_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getLidoStats } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LIDO_STATS_KEY, Response>();

// proxy for third-party API; returns steth token information
const lidoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LIDO_STATS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const lidoStats = await getLidoStats();
      cache.put(CACHE_LIDO_STATS_KEY, lidoStats, CACHE_LIDO_STATS_TTL);

      res.status(200).json(lidoStats);
    }
  } catch (error) {
    res.status(500).send(error.message ?? DEFAULT_API_ERROR_MESSAGE);
  }
};

export default lidoStats;
