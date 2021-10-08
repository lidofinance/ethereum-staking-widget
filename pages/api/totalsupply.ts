import { Cache } from 'memory-cache';
import {
  CACHE_TOTAL_SUPPLY_KEY,
  CACHE_TOTAL_SUPPLY_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getTotalStaked } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_TOTAL_SUPPLY_KEY, string>();

// Proxy for third-party API.
const totalSupply: API = async (req, res) => {
  try {
    const cachedTotalSupply = cache.get(CACHE_TOTAL_SUPPLY_KEY);

    if (cachedTotalSupply) {
      res.json(cachedTotalSupply);
    } else {
      const totalSupply = await getTotalStaked();
      cache.put(CACHE_TOTAL_SUPPLY_KEY, totalSupply, CACHE_TOTAL_SUPPLY_TTL);

      res.json(totalSupply);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default totalSupply;
