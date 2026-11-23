import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  HttpMethod,
  httpMethodGuard,
  rateLimit,
  responseTimeMetric,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { portfolioPositionsHandler } from 'utilsApi/portfolio';

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(
    Metrics.request.apiTimings,
    API_ROUTES.PORTFOLIO_POSITIONS,
  ),
  cacheControl({ headers: config.CACHE_PORTFOLIO_HEADERS }),
  defaultErrorHandler,
])(portfolioPositionsHandler);
