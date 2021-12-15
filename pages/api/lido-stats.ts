import { Cache } from 'memory-cache';
import {
  CACHE_LIDO_STATS_KEY,
  CACHE_LIDO_STATS_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getLidoStats } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_LIDO_STATS_KEY, unknown>();

// Proxy for third-party API.
// Returns steth token information
// DEPRECATED: In future will be delete!!!
const lidoStats: API = async (req, res) => {
  try {
    const cachedLidoStats = cache.get(CACHE_LIDO_STATS_KEY);

    if (cachedLidoStats) {
      res.status(200).json(cachedLidoStats);
    } else {
      const lidoStats = await getLidoStats();
      cache.put(
        CACHE_LIDO_STATS_KEY,
        { data: lidoStats },
        CACHE_LIDO_STATS_TTL,
      );

      res.status(200).json({ data: lidoStats });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default lidoStats;
