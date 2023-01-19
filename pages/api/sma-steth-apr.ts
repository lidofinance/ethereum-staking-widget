import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { API } from 'types';
import {
  CACHE_SMA_STETH_APR_KEY,
  CACHE_SMA_STETH_APR_TTL,
  API_ROUTES,
} from 'config';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  getSmaStethApr,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const cache = new Cache<typeof CACHE_SMA_STETH_APR_KEY, string>();

const smaStethApr: API = async (req, res) => {
  const cachedStethApr = cache.get(CACHE_SMA_STETH_APR_KEY);

  if (cachedStethApr) {
    res.json(cachedStethApr);
  } else {
    const smaStethApr = await getSmaStethApr();
    cache.put(CACHE_SMA_STETH_APR_KEY, smaStethApr, CACHE_SMA_STETH_APR_TTL);

    res.json(smaStethApr);
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SMA_STETH_APR),
  ...errorAndCacheDefaultWrappers,
])(smaStethApr);
