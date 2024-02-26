import { Cache } from 'memory-cache';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { getConfig } from 'config';
const {
  CACHE_TOTAL_SUPPLY_KEY,
  CACHE_TOTAL_SUPPLY_TTL,
  CACHE_TOTAL_SUPPLY_HEADERS,
} = getConfig();

import { API_ROUTES } from 'consts/api';
import {
  getTotalStaked,
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
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
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.TOTALSUPPLY),
  cacheControl({ headers: CACHE_TOTAL_SUPPLY_HEADERS }),
  defaultErrorHandler,
])(totalSupply);
