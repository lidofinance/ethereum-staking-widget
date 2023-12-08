import { BigNumber } from 'ethers';
import { Cache } from 'memory-cache';
import { NextApiRequest, NextApiResponse } from 'next';

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
  methodAllowList,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

const cache = new Cache<string, unknown>();

const DEFAULT_AMOUNT = BigNumber.from(10).pow(18);
const TOKEN_ETH = 'ETH';
const TOKEN_ALLOWED_LIST = [TOKEN_ETH, TOKENS.STETH, TOKENS.WSTETH];

const validateAndGetQueryToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string> => {
  let token = req.query?.token || TOKEN_ETH;

  // Token can be array - /api/oneinch-rate/?token=eth&token=eth&token=eth
  if (Array.isArray(token)) {
    token = token[0];
  }

  token = token.toLocaleUpperCase();

  if (!TOKEN_ALLOWED_LIST.includes(token)) {
    res.status(400);
    throw new Error(`You can use only: ${TOKEN_ALLOWED_LIST.toString()}`);
  }

  return token;
};

// Proxy for third-party API.
// Query params:
// * (optional) token: see TOKEN_ALLOWED_LIST above. Default see TOKEN_ETH above.
// Returns 1inch rate
const oneInchRate: API = async (req, res) => {
  const token = await validateAndGetQueryToken(req, res);
  const cacheKey = `${CACHE_ONE_INCH_RATE_KEY}-${token}`;
  const cachedOneInchRate = cache.get(cacheKey);

  if (cachedOneInchRate) {
    res.status(200).json(cachedOneInchRate);
    return;
  }

  // Execute below if not found a cache
  let oneInchRate;

  if (token === TOKEN_ETH) {
    oneInchRate = await getOneInchRate(
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      getTokenAddress(CHAINS.Mainnet, TOKENS.STETH),
      DEFAULT_AMOUNT,
    );
  } else {
    oneInchRate = await getOneInchRate(
      getTokenAddress(CHAINS.Mainnet, token as TOKENS),
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      DEFAULT_AMOUNT,
    );
  }
  cache.put(cacheKey, { rate: oneInchRate }, CACHE_ONE_INCH_RATE_TTL);

  res.status(200).json({ rate: oneInchRate });
};

export default wrapNextRequest([
  methodAllowList([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  ...errorAndCacheDefaultWrappers,
])(oneInchRate);
