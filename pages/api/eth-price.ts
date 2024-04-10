import { Cache } from 'memory-cache';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  getEthPrice,
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof config.CACHE_ETH_PRICE_KEY, unknown>();

// Proxy for third-party API.
const ethPrice: API = async (req, res) => {
  const cachedEthPrice = cache.get(config.CACHE_ETH_PRICE_KEY);

  if (cachedEthPrice) {
    res.json(cachedEthPrice);
  } else {
    const ethPrice = await getEthPrice();
    cache.put(
      config.CACHE_ETH_PRICE_KEY,
      { price: ethPrice },
      config.CACHE_ETH_PRICE_TTL,
    );

    res.json({ price: ethPrice });
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_PRICE),
  cacheControl({ headers: config.CACHE_ETH_PRICE_HEADERS }),
  defaultErrorHandler,
])(ethPrice);
