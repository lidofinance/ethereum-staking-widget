import { Cache } from 'memory-cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';

import { parseEther } from '@ethersproject/units';
import { Zero } from '@ethersproject/constants';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
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
import { FetcherError } from 'utils/fetcherError';
import { API } from 'types';

type OneInchRateResponse = {
  rate: number;
  toReceive: string;
};

const cache = new Cache<string, OneInchRateResponse>();

const DEFAULT_AMOUNT = parseEther('1');
const TOKEN_ETH = 'ETH';
// Amounts larger make 1inch API return 500
const MAX_BIGINT = BigNumber.from(
  '10000000000000000000000000000000000000000000000000000000000000000000',
);
const TOKEN_ALLOWED_LIST = [TOKEN_ETH, TOKENS.STETH, TOKENS.WSTETH];
const ETH_DUMMY_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const PASSTHROUGH_CODES = [400, 422, 429];

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
      throw new Error(`You can only use ${TOKEN_ALLOWED_LIST.toString()}`);
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
      if (amount.gt(MAX_BIGINT)) throw new Error('Amount too large');
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid request';
    res.status(422).json({ error: message });
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
  const cacheKey = `${config.CACHE_ONE_INCH_RATE_KEY}-${token}-${amount}`;
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

  try {
    const oneInchRate = await getOneInchRate(fromToken, toToken, amount);
    invariant(oneInchRate);
    const result = {
      rate: oneInchRate.rate,
      toReceive: oneInchRate.toAmount.toString(),
    };
    cache.put(cacheKey, result, config.CACHE_ONE_INCH_RATE_TTL);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof FetcherError && PASSTHROUGH_CODES.includes(err.status)) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error('[oneInchRate] Request to 1inch failed', err);
    throw err;
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  ...errorAndCacheDefaultWrappers,
])(oneInchRate);
