import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_LATER_SUNSET_TIMESTAMP,
  API_ROUTES,
  ETH_API_ROUTES,
  getReplacementLink,
} from 'consts/api';

import {
  cors,
  errorAndCacheDefaultWrappers,
  HttpMethod,
  httpMethodGuard,
  rateLimit,
  responseTimeMetric,
  sunsetBy,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createEthApiProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SHORT_LIDO_STATS),
  sunsetBy({
    sunsetTimestamp: API_LATER_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.SHORT_LIDO_STATS),
  }),
  ...errorAndCacheDefaultWrappers,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_LIDO_SHORT_STATS_TTL,
    endpoint: ETH_API_ROUTES.STETH_STATS,
    ignoreParams: true,
  }),
);
