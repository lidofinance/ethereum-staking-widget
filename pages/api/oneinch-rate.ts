import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import {
  CACHE_ONE_INCH_RATE_KEY,
  CACHE_ONE_INCH_RATE_TTL,
  API_ROUTES,
} from 'config';
import {
  getOneInchRate,
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';
import { BigNumber } from 'ethers';

const cache = new Cache<typeof CACHE_ONE_INCH_RATE_KEY, unknown>();

const DEFAULT_AMOUNT = BigNumber.from(10).pow(18);

// Proxy for third-party API.
// Returns 1inch rate
const oneInchRate: API = async (req, res) => {
  const cachedOneInchRate = cache.get(CACHE_ONE_INCH_RATE_KEY);

  if (cachedOneInchRate) {
    res.status(200).json(cachedOneInchRate);
  } else {
    const oneInchRate = await getOneInchRate(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      getTokenAddress(CHAINS.Mainnet, TOKENS.STETH),
      DEFAULT_AMOUNT,
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
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  ...errorAndCacheDefaultWrappers,
])(oneInchRate);
