import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  CACHE_WHITELIST_FILES_PATHS,
  findCacheControlFilePath,
} from 'config/cache';

// use only for cache files
const middleware = (req: NextRequest) => {
  const response = NextResponse.next();
  const methodName = req.nextUrl.pathname;
  // Use whitelist
  const pathKey = findCacheControlFilePath(methodName);
  if (!pathKey) return response;

  response.headers.append(
    'Cache-Control',
    CACHE_WHITELIST_FILES_PATHS[pathKey],
  );

  return response;
};

export const config = {
  // paths where use middleware
  matcher: ['/manifest.json', '/favicon:size*'],
};

export default middleware;
