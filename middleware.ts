import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CACHE_WHITELIST_PATHS } from 'config/cache';

const middleware = (req: NextRequest) => {
  const response = NextResponse.next();
  const methodName = req.nextUrl.pathname;

  // Do not use cache-control for errors
  if (!response.ok) return response;

  // Use whitelist
  const whitelist = Object.keys(CACHE_WHITELIST_PATHS);
  const pathKey = whitelist.find((path) =>
    new RegExp(`^${path}?$`).test(methodName),
  );

  if (!pathKey) return response;

  response.headers.append('Cache-Control', CACHE_WHITELIST_PATHS[pathKey]);

  return response;
};

export const config = {
  // paths where use middleware
  matcher: ['/api/:path*', '/manifest.json', '/favicon:size*'],
};

export default middleware;
