import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { metricsFactory } from '@lidofinance/next-pages';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import { responseTimeMetric, defaultErrorHandler, rateLimit } from 'utilsApi';
import Metrics from 'utilsApi/metrics';

const metrics = metricsFactory({
  registry: Metrics.registry,
});

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.METRICS),
  cacheControl({ headers: config.CACHE_METRICS_HEADERS }),
  defaultErrorHandler,
])(metrics);
