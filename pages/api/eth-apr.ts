import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { API } from 'types';
import { config } from 'config';
import {
  API_DEFAULT_SUNSET_TIMESTAMP,
  API_ROUTES,
  getReplacementLink,
} from 'consts/api';
import {
  getEthApr,
  errorAndCacheDefaultWrappers,
  responseTimeMetric,
  rateLimit,
  sunsetBy,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const cache = new Cache<typeof config.CACHE_ETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns eth annual percentage rate
// TODO: delete after viewing grafana
const ethApr: API = async (_, res) => {
  const cachedEthApr = cache.get(config.CACHE_ETH_APR_KEY);

  if (cachedEthApr) {
    res.json(cachedEthApr);
  } else {
    const ethApr = await getEthApr();
    cache.put(config.CACHE_ETH_APR_KEY, ethApr, config.CACHE_ETH_APR_TTL);

    res.json(ethApr);
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_APR),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.ETH_APR),
  }),
  ...errorAndCacheDefaultWrappers,
])(ethApr);
