import { Cache } from 'memory-cache';
import {
  CACHE_STETH_APR_KEY,
  CACHE_STETH_APR_TTL,
  CACHE_DEFAULT_HEADERS,
  CACHE_DEFAULT_ERROR_HEADERS,
} from 'config';
import {
  getStethApr,
  wrapRequest,
  defaultErrorHandler,
  cacheControl,
  errorCacheControl,
} from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_STETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns steth annual percentage rate after lido fee is applied
const stethApr: API = async (req, res) => {
  const cachedStethApr = cache.get(CACHE_STETH_APR_KEY);

  if (cachedStethApr) {
    res.json(cachedStethApr);
  } else {
    const stethApr = await getStethApr();
    cache.put(CACHE_STETH_APR_KEY, stethApr, CACHE_STETH_APR_TTL);

    res.json(stethApr);
  }
};

export default wrapRequest(stethApr, [
  cacheControl(CACHE_DEFAULT_HEADERS),
  errorCacheControl(CACHE_DEFAULT_ERROR_HEADERS),
  defaultErrorHandler,
]);
