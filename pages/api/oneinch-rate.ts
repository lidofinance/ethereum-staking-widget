import { Cache } from 'memory-cache';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import {
  CACHE_ONE_INCH_RATE_KEY,
  CACHE_ONE_INCH_RATE_TTL,
  API_ROUTES,
} from 'config';
import {
  getOneInchRate,
  wrapNextRequest,
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<typeof CACHE_ONE_INCH_RATE_KEY, unknown>();

// Proxy for third-party API.
// Returns 1inch rate
const oneInchRate: API = async (req, res) => {
  const cachedOneInchRate = cache.get(CACHE_ONE_INCH_RATE_KEY);

  if (cachedOneInchRate) {
    res.status(200).json(cachedOneInchRate);
  } else {
    const amount = 10 ** 18;
    const oneInchRate = await getOneInchRate(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      getTokenAddress(CHAINS.Mainnet, TOKENS.STETH),
      amount,
    );
    cache.put(
      CACHE_ONE_INCH_RATE_KEY,
      { rate: oneInchRate },
      CACHE_ONE_INCH_RATE_TTL,
    );

    res.status(200).json({ rate: oneInchRate });
  }
};

export default wrapNextRequest([
  rateLimit(),
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  ...errorAndCacheDefaultWrappers,
])(oneInchRate);
