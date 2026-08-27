import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
} from 'utilsApi';
import { geoHandler } from 'utilsApi/geo-handler';
import Metrics from 'utilsApi/metrics';

// No `cors` wrapper here, unlike the other routes. Those serve public data;
// this one answers with the caller's own country. Without an
// `Access-Control-Allow-Origin` header the browser lets only our own pages
// read the answer, so another site cannot fetch it from a visitor's browser
// to learn where they are. Embedding still works: inside an iframe the page
// origin is still ours.
export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.GEO),
  cacheControl({ headers: config.CACHE_GEO_HEADERS }),
  defaultErrorHandler,
])(geoHandler);
