import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import { API_ROUTES } from 'consts/api';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';

import Metrics from 'utilsApi/metrics';
import { metricsFactory } from '@lidofinance/next-pages';

const metrics = metricsFactory({
  registry: Metrics.registry,
});

export default wrapNextRequest([
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.METRICS),
  ...errorAndCacheDefaultWrappers,
])(metrics);
