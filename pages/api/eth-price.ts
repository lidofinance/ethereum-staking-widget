import { Cache } from 'memory-cache';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import {
  CACHE_ETH_PRICE_KEY,
  CACHE_ETH_PRICE_TTL,
  CACHE_ETH_PRICE_HEADERS,
  API_ROUTES,
} from 'config';
import {
  getEthPrice,
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ETH_PRICE_KEY, unknown>();

// Proxy for third-party API.
const ethPrice: API = async (req, res) => {
  const cachedEthPrice = cache.get(CACHE_ETH_PRICE_KEY);

  if (cachedEthPrice) {
    res.json(cachedEthPrice);
  } else {
    const ethPrice = await getEthPrice();
    cache.put(CACHE_ETH_PRICE_KEY, { price: ethPrice }, CACHE_ETH_PRICE_TTL);

    res.json({ price: ethPrice });
  }
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_PRICE),
  cacheControl({ headers: CACHE_ETH_PRICE_HEADERS }),
  defaultErrorHandler,
])(ethPrice);
