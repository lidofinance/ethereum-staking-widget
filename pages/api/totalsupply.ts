import { Cache } from 'memory-cache';
import {
  CACHE_TOTAL_SUPPLY_KEY,
  CACHE_TOTAL_SUPPLY_TTL,
  CACHE_TOTAL_SUPPLY_HEADERS,
  API_ROUTES,
} from 'config';
import {
  getTotalStaked,
  wrapNextRequest,
  defaultErrorHandler,
  cacheControl,
  responseTimeMetric,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof CACHE_TOTAL_SUPPLY_KEY, string>();

// Proxy for third-party API.
const totalSupply: API = async (req, res) => {
  const cachedTotalSupply = cache.get(CACHE_TOTAL_SUPPLY_KEY);

  if (cachedTotalSupply) {
    res.json(cachedTotalSupply);
  } else {
    const totalSupply = await getTotalStaked();
    cache.put(CACHE_TOTAL_SUPPLY_KEY, totalSupply, CACHE_TOTAL_SUPPLY_TTL);

    res.json(totalSupply);
  }
};

export default wrapNextRequest([
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.TOTALSUPPLY),
  cacheControl(CACHE_TOTAL_SUPPLY_HEADERS),
  defaultErrorHandler,
])(totalSupply);
