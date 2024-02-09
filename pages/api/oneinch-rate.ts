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
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';
import { parseEther } from '@ethersproject/units';
import { Zero } from '@ethersproject/constants';
import { BigNumber } from 'ethers';

type OneInchRateResponse = {
  rate: number;
  toReceive: string;
};

const cache = new Cache<string, OneInchRateResponse>();

const DEFAULT_AMOUNT = parseEther('1');
const TOKEN_ETH = 'ETH';
const TOKEN_ALLOWED_LIST = [TOKEN_ETH, TOKENS.STETH, TOKENS.WSTETH];
const ETH_DUMMY_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const validateAndParseParams = (req: NextApiRequest, res: NextApiResponse) => {
  let token = req.query?.token || TOKEN_ETH;
  let amount = DEFAULT_AMOUNT;
  try {
    // Token can be array - /api/oneinch-rate?token=eth&token=eth&token=eth
    if (Array.isArray(token)) {
      throw new Error(`Token must be a string`);
    }

    token = token.toLocaleUpperCase();
    if (!TOKEN_ALLOWED_LIST.includes(token)) {
      throw new Error(`You can use only: ${TOKEN_ALLOWED_LIST.toString()}`);
    }

    if (req.query.amount) {
      if (token === 'ETH') {
        throw new Error(`Amount is not allowed to token ETH`);
      }
      if (Array.isArray(req.query.amount)) {
        throw new Error(`Amount must be a string`);
      }
      try {
        amount = BigNumber.from(req.query.amount);
      } catch {
        throw new Error(`Amount must be a valid BigNumber string`);
      }
      if (amount.lte(Zero)) throw new Error(`Amount must be positive`);
    }
  } catch (e) {
    res.status(422);
    throw e;
  }

  return { token, amount };
};

// Proxy for third-party API.
// Query params:
// * (optional) token: see TOKEN_ALLOWED_LIST above. Default see TOKEN_ETH above.
// * (optional) amount: BigNumber string. Default see DEFAULT_AMOUNT above.
// Returns 1inch rate
const oneInchRate: API = async (req, res) => {
  const { token, amount } = validateAndParseParams(req, res);
  const cacheKey = `${CACHE_ONE_INCH_RATE_KEY}-${token}-${amount}`;
  const cachedOneInchRate = cache.get(cacheKey);

  if (cachedOneInchRate) {
    res.status(200).json(cachedOneInchRate);
    return;
  }

  // for ETH, ETH -> STETH
  // else, TOKEN -> ETH
  const fromToken =
    token === TOKEN_ETH
      ? ETH_DUMMY_ADDRESS
      : getTokenAddress(CHAINS.Mainnet, token as TOKENS);
  const toToken =
    token === TOKEN_ETH
      ? getTokenAddress(CHAINS.Mainnet, TOKENS.STETH)
      : ETH_DUMMY_ADDRESS;
  const oneInchRate = await getOneInchRate(fromToken, toToken, amount);

  if (!oneInchRate) {
    res.status(500);
    throw new Error('Could not fetch 1inch rate');
  }
  const result = {
    rate: oneInchRate.rate,
    toReceive: oneInchRate.toAmount.toString(),
  };

  cache.put(cacheKey, result, CACHE_ONE_INCH_RATE_TTL);
  res.status(200).json(result);
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  ...errorAndCacheDefaultWrappers,
])(oneInchRate);
