import { getStatusLabel } from '@lidofinance/api-metrics';
import {
  RequestWrapper,
  wrapRequest as wrapNextRequest,
  cacheControl,
  DefaultErrorHandlerArgs,
  DEFAULT_API_ERROR_MESSAGE,
} from '@lidofinance/next-api-wrapper';
import { rateLimitWrapper } from '@lidofinance/next-ip-rate-limit';
import { Histogram } from 'prom-client';
import { serverLogger } from 'utilsApi';
import {
  CACHE_DEFAULT_HEADERS,
  RATE_LIMIT,
  RATE_LIMIT_TIME_FRAME,
} from 'config';

export const extractErrorMessage = (
  error: unknown,
  defaultMessage?: string,
): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return defaultMessage ?? DEFAULT_API_ERROR_MESSAGE;
};

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

export const nextDefaultErrorHandler =
  (args?: DefaultErrorHandlerArgs): RequestWrapper =>
  async (req, res, next) => {
    const { errorMessage = DEFAULT_API_ERROR_MESSAGE, serverLogger } =
      args || {};
    try {
      await next?.(req, res, next);
    } catch (error) {
      const isInnerError = res.statusCode === 200;
      const status = isInnerError ? 500 : res.statusCode || 500;

      if (error instanceof Error) {
        const serverError = 'status' in error && (error.status as number);
        serverLogger?.error(extractErrorMessage(error, errorMessage));
        res
          .status(serverError || status)
          .json({ message: extractErrorMessage(error, errorMessage) });
      } else {
        res.status(status).json({ message: errorMessage });
      }
    }
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
