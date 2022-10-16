import { NextApiResponse, NextApiRequest } from 'next';
import { getStatusLabel } from '@lidofinance/api-metrics';
import { Histogram } from 'prom-client';
import { API } from 'types';
import { serverLogger } from 'utilsApi';
import {
  DEFAULT_API_ERROR_MESSAGE,
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_DEFAULT_HEADERS,
  RATE_LIMIT,
  RATE_LIMIT_TIME_FRAME,
} from 'config';
import { setRateLimit } from 'utilsApi';

type RequestWrapper = (
  req: NextApiRequest,
  res: NextApiResponse,
  next?: API | RequestWrapper,
) => void;

export const wrapNextRequest =
  (wrappers: RequestWrapper[]) => (requestHandler: API) => {
    return wrappers.reduce(
      (acc, cur) => (req, res) => cur(req, res, () => acc(req, res)),
      requestHandler,
    );
  };

// must be last in the wrapper stack
export const defaultErrorHandler: RequestWrapper = async (req, res, next) => {
  try {
    await next?.(req, res, next);
  } catch (error) {
    if (error instanceof Error) {
      serverLogger.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
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

export const cacheControl =
  (headers: string): RequestWrapper =>
  async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', headers);

      await next?.(req, res, next);
    } catch (error) {
      // for requests with cache-control headers
      // need set new headers otherwise error will be cached
      res.setHeader('Cache-Control', CACHE_DEFAULT_ERROR_HEADERS);

      // throw error up the stack
      throw error;
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

// ready wrapper types

export const errorAndCacheDefaultWrappers = [
  cacheControl(CACHE_DEFAULT_HEADERS),
  defaultErrorHandler,
];
export const defaultErrorAndCacheWrapper = wrapNextRequest([
  ...errorAndCacheDefaultWrappers,
]);
