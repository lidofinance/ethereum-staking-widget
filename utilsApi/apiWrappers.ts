import { NextApiResponse, NextApiRequest } from 'next';
import { API } from 'types';
import { DEFAULT_API_ERROR_MESSAGE } from 'config';

type RequestWrapper = (
  req: NextApiRequest,
  res: NextApiResponse,
  next?: API | RequestWrapper,
) => void;

export const wrapRequest = (
  requestHandler: API,
  wrappers: RequestWrapper[],
) => {
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
      console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    } else {
      res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
    }
  }
};

export const cacheControl =
  (headers: string): RequestWrapper =>
  async (req, res, next) => {
    const pathKey = req.url?.split('?').shift();
    if (pathKey) res.setHeader('Cache-Control', headers);

    await next?.(req, res, next);
  };

// for requests with cache-control headers
// need set new headers otherwise error will be cached
export const errorCacheControl =
  (headers: string): RequestWrapper =>
  async (req, res, next) => {
    try {
      await next?.(req, res, next);
    } catch (error) {
      res.setHeader('Cache-Control', headers);

      // throw error up the stack
      throw error;
    }
  };
