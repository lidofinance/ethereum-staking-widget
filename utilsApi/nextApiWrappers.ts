import { getStatusLabel } from '@lidofinance/api-metrics';
import {
  RequestWrapper,
  wrapRequest as wrapNextRequest,
  defaultErrorHandler as nextDefaultErrorHandler,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { Histogram } from 'prom-client';
import { serverLogger } from 'utilsApi';
import {
  CACHE_DEFAULT_HEADERS,
  RATE_LIMIT,
  RATE_LIMIT_TIME_FRAME,
} from 'config';
import { setRateLimit } from 'utilsApi';

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

export const rateLimit = (): RequestWrapper => async (req, res, next) => {
  setRateLimit({
    req,
    res,
    limit: RATE_LIMIT,
    timeFrame: RATE_LIMIT_TIME_FRAME,
  });

  // finish processing the request and return a 429 response
  if (res.statusCode === 429) return;

  await next?.(req, res, next);
};

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
