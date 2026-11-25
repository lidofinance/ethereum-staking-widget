import type { NextApiRequest, NextApiResponse } from 'next';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { metricsFactory } from '@lidofinance/next-pages';

import { config as appConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import { responseTimeMetric, defaultErrorHandler, rateLimit } from 'utilsApi';
import Metrics from 'utilsApi/metrics';

// GET-only Prometheus exposition — scrapers never send a body, so skip
// bodyParser entirely to avoid allocating up to 1MB per request.
export const config = {
  api: {
    bodyParser: false,
  },
};

const metricsHandler = metricsFactory({
  registry: Metrics.registry,
});

const metrics = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  // Explicitly set the Prometheus exposition Content-Type to ensure
  // compatibility with Prometheus 3.x, which requires a valid Content-Type header.
  res.setHeader('Content-Type', Metrics.registry.contentType);
  await metricsHandler(req, res);
};

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.METRICS),
  cacheControl({ headers: appConfig.CACHE_METRICS_HEADERS }),
  defaultErrorHandler,
])(metrics);
