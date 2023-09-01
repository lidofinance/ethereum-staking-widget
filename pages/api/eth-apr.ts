import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { CACHE_ETH_APR_KEY, CACHE_ETH_APR_TTL, API_ROUTES } from 'config';
import {
  getEthApr,
  errorAndCacheDefaultWrappers,
  responseTimeMetric,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns eth annual percentage rate
// TODO: delete after viewing grafana
const ethApr: API = async (_, res) => {
  const cachedEthApr = cache.get(CACHE_ETH_APR_KEY);

  if (cachedEthApr) {
    res.json(cachedEthApr);
  } else {
    const ethApr = await getEthApr();
    cache.put(CACHE_ETH_APR_KEY, ethApr, CACHE_ETH_APR_TTL);

    res.json(ethApr);
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_APR),
  ...errorAndCacheDefaultWrappers,
])(ethApr);
