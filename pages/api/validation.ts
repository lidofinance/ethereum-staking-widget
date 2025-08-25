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
if (!secretConfig.validationAPI) {
  console.info(
    '[api/validation] Skipped setup: secretConfig.validationAPI is null',
  );
  handler = (_: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  };
} else {
  handler = (req: NextApiRequest, res: NextApiResponse) =>
    createCachedProxy({
      proxyUrl: secretConfig.validationAPI + '/v1/check/' + req.query.address,
      cacheTTL: 1000,
      ignoreParams: false,
      metricsHost: secretConfig.validationAPI,
      timeout: 10_000,
    })(req, res);
}

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.VALIDATION),
  cacheControl({ headers: config.CACHE_VALIDATION_HEADERS }),
  defaultErrorHandler,
])(handler);
