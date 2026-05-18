import type { NextApiRequest, NextApiResponse } from 'next';
import type { API } from '@lidofinance/next-api-wrapper';
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
import { REWARDS_ALLOWED_QUERY_PARAMS } from 'utilsApi/rewards-query-schema';
import { createRewardsHandler } from 'utilsApi/rewards-handler';

let handler: API;
if (!secretConfig.rewardsBackendAPI) {
  console.info(
    '[api/rewards] Skipped setup: secretConfig.rewardsBackendAPI is null',
  );
  handler = (_: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  };
} else {
  const proxy = createCachedProxy({
    proxyUrl: secretConfig.rewardsBackendAPI + '/',
    cacheTTL: 1000,
    ignoreParams: false,
    allowedQueryParams: REWARDS_ALLOWED_QUERY_PARAMS,
    metricsHost: secretConfig.rewardsBackendAPI,
    timeout: 10_000,
  });

  handler = createRewardsHandler(proxy);
}

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.REWARDS),
  cacheControl({ headers: config.CACHE_REWARDS_HEADERS }),
  defaultErrorHandler,
])(handler);
