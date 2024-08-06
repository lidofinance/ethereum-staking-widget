import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';

import { API_DEFAULT_SUNSET_TIMESTAMP, API_ROUTES } from 'consts/api';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
  sunsetBy,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import lidoStats from './lido-stats';

// Mirror for /lido-stats
export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.LIDOSTATS),
  sunsetBy({
    sunsetTimestamp: API_DEFAULT_SUNSET_TIMESTAMP,
  }),
  ...errorAndCacheDefaultWrappers,
])(lidoStats);
