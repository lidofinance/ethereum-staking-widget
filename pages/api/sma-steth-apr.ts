import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_DEFAULT_SUNSET_TIMESTAMP,
  API_ROUTES,
  ETH_API_ROUTES,
  getReplacementLink,
} from 'consts/api';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  sunsetBy,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createEthApiProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SMA_STETH_APR),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.SMA_STETH_APR),
  }),
  ...errorAndCacheDefaultWrappers,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_SMA_STETH_APR_TTL,
    endpoint: ETH_API_ROUTES.STETH_SMA_APR,
    ignoreParams: true,
    transformData: (data) => data.data.smaApr.toFixed(1),
  }),
);
