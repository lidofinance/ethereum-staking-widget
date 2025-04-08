import type { NextApiRequest, NextApiResponse } from 'next';
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

let handler;
if (!secretConfig.rewardsBackendAPI) {
  console.error(
    '[createCachedProxy] Skipped setup: secretConfig.rewardsBackendAPI is null',
  );
  handler = (_: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  };
} else {
  handler = createCachedProxy({
    proxyUrl: secretConfig.rewardsBackendAPI + '/',
    cacheTTL: 1000,
    ignoreParams: false,
    metricsHost: secretConfig.rewardsBackendAPI,
    timeout: 10_000,
  });
}

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.REWARDS),
  cacheControl({ headers: config.CACHE_REWARDS_HEADERS }),
  defaultErrorHandler,
])(handler);
