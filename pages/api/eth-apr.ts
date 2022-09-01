import { Cache } from 'memory-cache';
import { CACHE_ETH_APR_KEY, CACHE_ETH_APR_TTL } from 'config';
import {
  getEthApr,
  defaultErrorAndCacheWrapper,
  responseTimeExternalMetricWrapper,
} from 'utilsApi';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_APR_KEY, string>();

// Proxy for third-party API.
// Returns eth annual percentage rate
const ethApr: API = async (req, res) => {
  const cachedEthApr = cache.get(CACHE_ETH_APR_KEY);

  if (cachedEthApr) {
    res.json(cachedEthApr);
  } else {
    const ethApr = await responseTimeExternalMetricWrapper(getEthApr)(req, res);
    cache.put(CACHE_ETH_APR_KEY, ethApr, CACHE_ETH_APR_TTL);

    res.json(ethApr);
  }
};

export default defaultErrorAndCacheWrapper(ethApr);
