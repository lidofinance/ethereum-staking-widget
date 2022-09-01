import { NextApiResponse, NextApiRequest } from 'next';
import Metrics from 'utilsApi/metrics';
import { API } from 'types';
import {
  DEFAULT_API_ERROR_MESSAGE,
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_DEFAULT_HEADERS,
} from 'config';

export type MixedWrapper = <T = void>(api: API<T>) => RequestWrapper<T>;

type RequestWrapper<T = void> = (
  req: NextApiRequest,
  res: NextApiResponse,
  next?: API<T> | RequestWrapper<T>,
) => Promise<T>;

export const wrapRequest =
  <T = void>(wrappers: RequestWrapper<T>[]) =>
  (requestHandler: API<T>) =>
    wrappers.reduce(
      (acc, cur) => (req, res) => cur(req, res, () => acc(req, res)),
      requestHandler,
    );

// must be last in the wrapper stack
export const defaultErrorHandler =
  <T = void>(): RequestWrapper<T> =>
  async (req, res, next) => {
    let result;
    try {
      result = await next?.(req, res, next);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
      }
    }

    return result as T;
  };

export const responseTimeMetric =
  <T = void>(): RequestWrapper<T> =>
  async (req, res, next) => {
    const route = req.url;
    let status = 200;

    const endMetric = Metrics.apiTimings.startTimer({ route });

    try {
      const result = await next?.(req, res, next);
      endMetric({ status });

      return result as T;
    } catch (error) {
      status = 500;
      // throw error up the stack
      throw error;
    } finally {
      endMetric({ status });
    }
  };

export const responseTimeExternalMetric =
  <T = void>(): RequestWrapper<T> =>
  async (req, res, next) => {
    const route = req.url;
    let status = 200;

    const endMetric = Metrics.apiTimingsExternal.startTimer({ route });

    try {
      const result = await next?.(req, res, next);
      endMetric({ status });

      return result as T;
    } catch (error) {
      status = 500;
      // throw error up the stack
      throw error;
    } finally {
      endMetric({ status });
    }
  };

export const cacheControl =
  <T = void>(headers: string = CACHE_DEFAULT_HEADERS): RequestWrapper<T> =>
  async (req, res, next) => {
    try {
      res.setHeader('Cache-Control', headers);

      const result = await next?.(req, res, next);

      return result as T;
    } catch (error) {
      // for requests with cache-control headers
      // need set new headers otherwise error will be cached
      res.setHeader('Cache-Control', CACHE_DEFAULT_ERROR_HEADERS);

      // throw error up the stack
      throw error;
    }
  };

// ready wrapper types

export const defaultErrorAndCacheWrapper: MixedWrapper = wrapRequest([
  responseTimeMetric(),
  cacheControl(CACHE_DEFAULT_HEADERS),
  defaultErrorHandler(),
]);

export const responseTimeExternalMetricWrapper: MixedWrapper = wrapRequest([
  responseTimeExternalMetric(),
]);
