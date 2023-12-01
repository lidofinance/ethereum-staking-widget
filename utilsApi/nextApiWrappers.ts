import type { Histogram, Counter } from 'prom-client';
import { getStatusLabel } from '@lidofinance/api-metrics';
import {
  RequestWrapper,
  wrapRequest as wrapNextRequest,
  cacheControl,
  DefaultErrorHandlerArgs,
  DEFAULT_API_ERROR_MESSAGE,
} from '@lidofinance/next-api-wrapper';
import { rateLimitWrapper } from '@lidofinance/next-ip-rate-limit';
import {
  CACHE_DEFAULT_HEADERS,
  RATE_LIMIT,
  RATE_LIMIT_TIME_FRAME,
} from 'config';

export enum HttpMethod {
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export const extractErrorMessage = (
  error: unknown,
  defaultMessage?: string,
): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return defaultMessage ?? DEFAULT_API_ERROR_MESSAGE;
};

export type CorsWrapperType = {
  origin?: string[];
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  credentials?: boolean;
};

export const cors =
  ({
    origin = ['*'],
    methods = [HttpMethod.GET],
    allowedHeaders = ['*'],
    credentials = false,
  }: CorsWrapperType): RequestWrapper =>
  async (req, res, next) => {
    if (!req || !req.method) {
      res.status(405);
      throw new Error('Not HTTP method provided');
    }

    res.setHeader('Access-Control-Allow-Credentials', String(credentials));
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', methods.toString());
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.toString());

    if (req.method === HttpMethod.OPTIONS) {
      // In preflight just need return a CORS headers
      res.status(200).end();
      return;
    }

    await next?.(req, res, next);
  };

export const httpMethodGuard =
  (methodWhitelist: HttpMethod[]): RequestWrapper =>
  async (req, res, next) => {
    if (
      !req ||
      !req.method ||
      !Object.values(methodWhitelist).includes(req.method as HttpMethod)
    ) {
      res.status(405);
      throw new Error(`You can use only: ${methodWhitelist.toString()}`);
    }

    await next?.(req, res, next);
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

export const requestAddressMetric =
  (metrics: Counter<string>): RequestWrapper =>
  async (req, res, next) => {
    const referrer = req.headers.referer as string;

    const checkCallObject = (call: any) => {
      if (
        typeof call === 'object' &&
        call.method === 'eth_call' &&
        call.params[0].to
      ) {
        metrics.labels({ address: call.params[0].to, referrer }).inc(1);
      }
    };

    if (req.body) {
      if (Array.isArray(req.body)) {
        req.body.forEach(checkCallObject);
      } else {
        checkCallObject(req.body);
      }
    }

    await next?.(req, res, next);
  };

export const rateLimit = rateLimitWrapper({
  rateLimit: RATE_LIMIT,
  rateLimitTimeFrame: RATE_LIMIT_TIME_FRAME,
});

export const nextDefaultErrorHandler =
  (args?: DefaultErrorHandlerArgs): RequestWrapper =>
  async (req, res, next) => {
    const { errorMessage = DEFAULT_API_ERROR_MESSAGE, serverLogger: console } =
      args || {};
    try {
      await next?.(req, res, next);
    } catch (error) {
      const isInnerError = res.statusCode === 200;
      const status = isInnerError ? 500 : res.statusCode || 500;

      if (error instanceof Error) {
        const serverError = 'status' in error && (error.status as number);
        console?.error(extractErrorMessage(error, errorMessage));
        res
          .status(serverError || status)
          .json({ message: extractErrorMessage(error, errorMessage) });
      } else {
        res.status(status).json({ message: errorMessage });
      }
    }
  };

export const defaultErrorHandler = nextDefaultErrorHandler({
  serverLogger: console,
});

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
