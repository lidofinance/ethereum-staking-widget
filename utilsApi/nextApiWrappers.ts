import { getStatusLabel } from '@lidofinance/api-metrics';
import {
  RequestWrapper,
  wrapRequest as wrapNextRequest,
  defaultErrorHandler as nextDefaultErrorHandler,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { rateLimitWrapper } from '@lidofinance/next-ip-rate-limit';
import { Histogram } from 'prom-client';
import { serverLogger } from 'utilsApi';
import {
  CACHE_DEFAULT_HEADERS,
  RATE_LIMIT,
  RATE_LIMIT_TIME_FRAME,
} from 'config';

export const responseTimeMetric =
  (metrics: Histogram<string>, route: string): RequestWrapper =>
  async (req, res, next) => {
    let status = '2xx';
    const endMetric = metrics.startTimer({ route });

    try {
      await next?.(req, res, next);
      status = getStatusLabel(res.statusCode);
    } catch (error) {
      status = getStatusLabel(res.statusCode);
      // throw error up the stack
      throw error;
    } finally {
      endMetric({ status });
    }
  };

export const rateLimit = rateLimitWrapper({
  rateLimit: RATE_LIMIT,
  rateLimitTimeFrame: RATE_LIMIT_TIME_FRAME,
});

export const defaultErrorHandler = nextDefaultErrorHandler({ serverLogger });

// ready wrapper types

export const errorAndCacheDefaultWrappers = [
  cacheControl({
    headers: CACHE_DEFAULT_HEADERS,
  }),
  defaultErrorHandler,
];
export const defaultErrorAndCacheWrapper = wrapNextRequest([
  ...errorAndCacheDefaultWrappers,
]);
