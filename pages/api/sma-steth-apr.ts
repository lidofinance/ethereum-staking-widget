import { Cache } from 'memory-cache';
import { API } from 'types';
import {
  CACHE_SMA_STETH_APR_KEY,
  CACHE_SMA_STETH_APR_TTL,
  API_ROUTES,
} from 'config';
import {
  wrapNextRequest,
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  getStethApr,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const cache = new Cache<typeof CACHE_SMA_STETH_APR_KEY, string>();

const smaStethApr: API = async (req, res) => {
  const cachedStethApr = cache.get(CACHE_SMA_STETH_APR_KEY);

  if (cachedStethApr) {
    res.json(cachedStethApr);
  } else {
    // uncomment after changes on landing
    // const stethApr = await getSmaStethApr();
    const stethApr = await getStethApr();
    cache.put(CACHE_SMA_STETH_APR_KEY, stethApr, CACHE_SMA_STETH_APR_TTL);

    res.json(stethApr);
  }
};

export default wrapNextRequest([
  rateLimit(),
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SMA_STETH_APR),
  ...errorAndCacheDefaultWrappers,
])(smaStethApr);
