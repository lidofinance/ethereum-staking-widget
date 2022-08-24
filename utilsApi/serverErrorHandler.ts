import { NextApiResponse } from 'next';
import { DEFAULT_API_ERROR_MESSAGE, findCacheControlPath } from 'config';

export const serverErrorHandler = (error: unknown, res: NextApiResponse) => {
  // for requests with cache-control headers from middleware.ts
  // need set new headers otherwise error will be cached
  const hasCacheControl = !!findCacheControlPath(res.req.url);
  if (hasCacheControl)
    res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (error instanceof Error) {
    console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
    res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
  } else {
    res.status(500).json(DEFAULT_API_ERROR_MESSAGE);
  }
};
