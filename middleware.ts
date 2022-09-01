import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { findCacheControlFileHeaders } from 'config/cache';

// use only for cache files
const middleware = (req: NextRequest) => {
  const response = NextResponse.next();
  const methodName = req.nextUrl.pathname;
  // Use whitelist
  const headers = findCacheControlFileHeaders(methodName);
  if (!headers) return response;

  response.headers.append('Cache-Control', headers);

  return response;
};

export const config = {
  // paths where use middleware
  matcher: ['/manifest.json', '/favicon:size*', '/', '/wrap'],
};

export default middleware;
