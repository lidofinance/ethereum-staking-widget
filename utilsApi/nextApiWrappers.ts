import { NextApiResponse, NextApiRequest } from 'next';
import { Histogram } from 'prom-client';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';
import { serverLogger } from 'utilsApi';
import {
  DEFAULT_API_ERROR_MESSAGE,
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_DEFAULT_HEADERS,
} from 'config';

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
  (metrics: Histogram<string>): RequestWrapper =>
  async (req, res, next) => {
    const route = req.url;
    let status = 200;

    const endMetric = metrics.startTimer({ route });

    try {
      await next?.(req, res, next);
      status = res.statusCode;
    } catch (error) {
      status = res.statusCode;
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

// ready wrapper types

export const defaultErrorAndCacheWrapper = wrapNextRequest([
  responseTimeMetric(Metrics.request.apiTimings),
  cacheControl(CACHE_DEFAULT_HEADERS),
  defaultErrorHandler,
]);
