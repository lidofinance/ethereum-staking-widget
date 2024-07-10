import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_LATER_SUNSET_TIMESTAMP,
  API_ROUTES,
  ETH_API_ROUTES,
  getReplacementLink,
} from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  sunsetBy,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';

import { createEthApiProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.ETH_PRICE),
  cacheControl({ headers: config.CACHE_ETH_PRICE_HEADERS }),
  sunsetBy({
    sunsetTimestamp: API_LATER_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.ETH_PRICE),
  }),
  defaultErrorHandler,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_ETH_PRICE_TTL,
    endpoint: ETH_API_ROUTES.ETH_PRICE,
    ignoreParams: true,
  }),
);
