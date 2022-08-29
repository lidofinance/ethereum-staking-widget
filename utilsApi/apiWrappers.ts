import { NextApiResponse, NextApiRequest } from 'next';
import { API } from 'types';
import { DEFAULT_API_ERROR_MESSAGE, CACHE_DEFAULT_ERROR_HEADERS } from 'config';

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
