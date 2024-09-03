import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createCachedProxy } from 'utilsApi/cached-proxy';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.REWARDS),
  cacheControl({ headers: config.CACHE_REWARDS_HEADERS }),
  defaultErrorHandler,
])(
  createCachedProxy({
    proxyUrl: (secretConfig.rewardsBackendAPI as string) + '/',
    cacheTTL: 1000,
    ignoreParams: false,
    metricsHost: secretConfig.rewardsBackendAPI,
    timeout: 10_000,
  }),
);
