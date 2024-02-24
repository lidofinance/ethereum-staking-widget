import { Cache } from 'memory-cache';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { CACHE_LIDO_SHORT_STATS_KEY, CACHE_LIDO_SHORT_STATS_TTL } from 'config';
import { API_ROUTES } from 'consts/api';
import { API, SubgraphChains } from 'types';
import {
  cors,
  errorAndCacheDefaultWrappers,
  getLidoHoldersViaSubgraphs,
  getStEthPrice,
  getTotalStaked,
  HttpMethod,
  httpMethodGuard,
  rateLimit,
  responseTimeMetric,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { parallelizePromises } from 'utils';

import { getOneConfig } from 'config/one-config/utils';
const { defaultChain } = getOneConfig();

const cache = new Cache<string, unknown>();

// Proxy for third-party API.
// Returns stETH token information
const shortLidoStats: API = async (req, res) => {
  const chainId = (Number(req.query.chainId) as SubgraphChains) || defaultChain;
  const cacheKey = `${CACHE_LIDO_SHORT_STATS_KEY}_${chainId}`;

  const cachedLidoStats = cache.get(cacheKey);
  if (cachedLidoStats) {
    res.status(200).json(cachedLidoStats);
  } else {
    const [lidoHolders, totalStaked, stEthPrice] = await parallelizePromises([
      getLidoHoldersViaSubgraphs(chainId),
      getTotalStaked(chainId),
      getStEthPrice(),
    ]);

    const shortLidoStats = {
      uniqueAnytimeHolders: lidoHolders?.data?.stats?.uniqueAnytimeHolders,
      uniqueHolders: lidoHolders?.data?.stats?.uniqueHolders,
      totalStaked,
      marketCap: Number(totalStaked) * stEthPrice,
    };

    // set the cache if there is all the data
    // because right now there is no request error handling in parallelizePromises
    if (lidoHolders && totalStaked && stEthPrice) {
      cache.put(cacheKey, shortLidoStats, CACHE_LIDO_SHORT_STATS_TTL);
    }

    res.status(200).json(shortLidoStats);
  }
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SHORT_LIDO_STATS),
  ...errorAndCacheDefaultWrappers,
])(shortLidoStats);
