import { Cache } from 'memory-cache';
import {
  CACHE_ETH_APR_KEY,
  CACHE_ETH_APR_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getEthApr } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns eth annual percentage rate
const ethApr: API = async (req, res) => {
  try {
    const cachedEthApr = cache.get(CACHE_ETH_APR_KEY);

    if (cachedEthApr) {
      res.json(cachedEthApr);
    } else {
      const ethApr = await getEthApr();
      cache.put(CACHE_ETH_APR_KEY, ethApr, CACHE_ETH_APR_TTL);

      res.json(ethApr);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export default ethApr;
