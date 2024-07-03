import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import {
  API_DEFAULT_SUNSET_TIMESTAMP,
  API_ROUTES,
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
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.TOTALSUPPLY),
  cacheControl({ headers: config.CACHE_TOTAL_SUPPLY_HEADERS }),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
    replacementLink: getReplacementLink(API_ROUTES.TOTALSUPPLY),
  }),
  defaultErrorHandler,
])(
  createEthApiProxy({
    cacheTTL: config.CACHE_TOTAL_SUPPLY_TTL,
    endpoint: '/v1/protocol/steth/stats',
    ignoreParams: true,
    transformData: (data) => data.totalStaked,
  }),
);
