import { Cache } from 'memory-cache';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  getTotalStaked,
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof config.CACHE_TOTAL_SUPPLY_KEY, string>();

// Proxy for third-party API.
const totalSupply: API = async (req, res) => {
  const cachedTotalSupply = cache.get(config.CACHE_TOTAL_SUPPLY_KEY);

  if (cachedTotalSupply) {
    res.json(cachedTotalSupply);
  } else {
    const totalSupply = await getTotalStaked();
    cache.put(
      config.CACHE_TOTAL_SUPPLY_KEY,
      totalSupply,
      config.CACHE_TOTAL_SUPPLY_TTL,
    );

    res.json(totalSupply);
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.TOTALSUPPLY),
  cacheControl({ headers: config.CACHE_TOTAL_SUPPLY_HEADERS }),
  defaultErrorHandler,
])(totalSupply);
