import { Cache } from 'memory-cache';
import {
  CACHE_STETH_APR_KEY,
  CACHE_STETH_APR_TTL,
  DEFAULT_API_ERROR_MESSAGE,
} from 'config';
import { getStethApr } from 'utils';
import { API } from 'types';

const cache = new Cache<typeof CACHE_STETH_APR_KEY, string>();

// returns steth annual percentage rate after lido fee is applied
const stethApr: API = async (req, res) => {
  try {
    const cachedStethApr = cache.get(CACHE_STETH_APR_KEY);

    if (cachedStethApr) {
      res.send(cachedStethApr);
    } else {
      const stethApr = await getStethApr();
      cache.put(CACHE_STETH_APR_KEY, stethApr, CACHE_STETH_APR_TTL);

      res.send(stethApr);
    }
  } catch (error) {
    res.status(500).send(error.message ?? DEFAULT_API_ERROR_MESSAGE);
  }
};

export default stethApr;
