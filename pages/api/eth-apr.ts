import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_DEFAULT_SUNSET_TIMESTAMP,
  API_ROUTES,
  ETH_API_ROUTES,
  getReplacementLink,
} from 'consts/api';
import {
  errorAndCacheDefaultWrappers,
  responseTimeMetric,
  rateLimit,
  sunsetBy,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createEthApiProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_APR),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.ETH_APR),
  }),
  ...errorAndCacheDefaultWrappers,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_ETH_APR_TTL,
    endpoint: ETH_API_ROUTES.ETH_APR,
    ignoreParams: true,
    transformData: (data) => data.data.apr.toFixed(1),
  }),
);
