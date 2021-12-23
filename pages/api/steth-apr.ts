import { Cache } from 'memory-cache';
import {
  CACHE_STETH_APR_KEY,
  CACHE_STETH_APR_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getStethApr } from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_STETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns steth annual percentage rate after lido fee is applied
const stethApr: API = async (req, res) => {
  try {
    const cachedStethApr = cache.get(CACHE_STETH_APR_KEY);

    if (cachedStethApr) {
      res.json(cachedStethApr);
    } else {
      const stethApr = await getStethApr();
      cache.put(CACHE_STETH_APR_KEY, stethApr, CACHE_STETH_APR_TTL);

      res.json(stethApr);
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

export default stethApr;
