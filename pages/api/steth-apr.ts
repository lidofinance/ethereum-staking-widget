import { Cache } from 'memory-cache';
import { CACHE_STETH_APR_KEY, CACHE_STETH_APR_TTL } from 'config';
import { getStethApr, serverErrorHandler } from 'utilsApi';
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
    serverErrorHandler(error, res);
  }
};

export default stethApr;
