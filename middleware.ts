import { cacheControlMiddlewareFactory } from '@lidofinance/next-cache-files-middleware';
import { CACHE_ALLOWED_LIST_FILES_PATHS } from 'config';

// use only for cache files
export const middleware = cacheControlMiddlewareFactory(
  CACHE_ALLOWED_LIST_FILES_PATHS,
);

export const config = {
  // paths where use middleware
  matcher: ['/manifest.json', '/favicon:size*', '/', '/wrap'],
};

export default middleware;
