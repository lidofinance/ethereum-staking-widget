import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_LATER_SUNSET_TIMESTAMP,
  API_ROUTES,
  ETH_API_ROUTES,
  getReplacementLink,
} from 'consts/api';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
  sunsetBy,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createEthApiProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ONEINCH_RATE),
  sunsetBy({
    sunsetTimestamp: API_LATER_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.ONEINCH_RATE),
  }),
  ...errorAndCacheDefaultWrappers,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_ONE_INCH_RATE_TTL,
    endpoint: ETH_API_ROUTES.SWAP_ONE_INCH,
    ignoreParams: false,
  }),
);
