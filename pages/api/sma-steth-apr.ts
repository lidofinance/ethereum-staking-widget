import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { API } from 'types';
import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  getSmaStethApr,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const cache = new Cache<typeof config.CACHE_SMA_STETH_APR_KEY, string>();

// TODO: deprecated, will be delete after check grafana dashboards
const smaStethApr: API = async (_, res) => {
  const cachedStethApr = cache.get(config.CACHE_SMA_STETH_APR_KEY);

  if (cachedStethApr) {
    res.json(cachedStethApr);
  } else {
    const smaStethApr = await getSmaStethApr();
    cache.put(
      config.CACHE_SMA_STETH_APR_KEY,
      smaStethApr,
      config.CACHE_SMA_STETH_APR_TTL,
    );

    res.json(smaStethApr);
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SMA_STETH_APR),
  ...errorAndCacheDefaultWrappers,
])(smaStethApr);
