import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { Cache } from 'memory-cache';
import {
  API_ROUTES,
  CACHE_ESTIMATE_WITHDRAWAL_GAS,
  CACHE_ESTIMATE_WITHDRAWAL_GAS_TTL,
} from 'config';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';

import { TOKENS } from '@lido-sdk/constants';
import { getRequestEstimate } from 'utilsApi/getRequestEstimate';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawals-constants';
import { ParamError } from 'utilsApi/apiHelpers';
import { supportedChains } from 'env-dynamics.mjs';

const cache = new Cache<string, number>();

// Estimates gas for withdrawal request using secured permit
// Returns { gasLimit:number }
const estimateWithdrawalGas: API = async (req, res) => {
  // METHOD BOUNDARY
  if (req.method !== 'GET') {
    res.status(405);
    return;
  }

  let chainId: number,
    token: TOKENS.STETH | TOKENS.WSTETH,
    requestCount: number;
  // PARAMS BOUNDARY
  try {
    chainId = parseInt(req.query.chainId as string);
    if (isNaN(chainId) || !supportedChains.includes(chainId)) {
      throw new ParamError({ chainId: 'invalid' });
    }
    token = req.query.token as TOKENS.STETH | TOKENS.WSTETH;
    if (![TOKENS.STETH, TOKENS.WSTETH].includes(token)) {
      throw new ParamError({ token: 'invalid' });
    }
    requestCount = parseInt(req.query.requestCount as string);
    if (
      isNaN(requestCount) ||
      requestCount < 1 ||
      requestCount > MAX_REQUESTS_COUNT
    ) {
      throw new ParamError({ requestCount: 'invalid' });
    }
  } catch (e) {
    res.status(422);
    if (e instanceof ParamError) {
      res.json(e.params);
    }
    return;
  }

  const cacheKey = CACHE_ESTIMATE_WITHDRAWAL_GAS(chainId, requestCount, token);
  const cachedGasLimit = cache.get(cacheKey);

  if (cachedGasLimit) {
    res.status(200).json({ gasLimit: cachedGasLimit });
    return;
  }

  const gasLimit = await getRequestEstimate({
    chainId,
    requestCount,
    token,
  }).catch(() => {
    throw new Error('Failed to estimate gas');
  });

  cache.put(cacheKey, gasLimit, CACHE_ESTIMATE_WITHDRAWAL_GAS_TTL);

  res.status(200).json({ gasLimit });
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(
    Metrics.request.apiTimings,
    API_ROUTES.ESTIMATE_WITHDRAWAL_GAS,
  ),
  ...errorAndCacheDefaultWrappers,
])(estimateWithdrawalGas);
