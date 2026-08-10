import {
  wrapRequest as wrapNextRequest,
  cacheControl,
  responseTimeMetric,
} from '@lidofinance/next-api-wrapper';
import { config } from 'config';
import {
  defaultErrorHandler,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import { geoDebugHandler } from 'utilsApi/geo-debug-handler';
import Metrics from 'utilsApi/metrics';
import { API_ROUTES } from 'consts/api';

// diagnostics: shows which geo signals reach the origin (IP Geolocation on the
// CF zone, managed transforms). Not a product route — see /api/geo when it lands
export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.GEO_DEBUG),
  cacheControl({ headers: config.CACHE_GEO_DEBUG_HEADERS }),
  defaultErrorHandler,
])(geoDebugHandler);
