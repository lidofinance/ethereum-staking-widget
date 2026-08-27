import type { FastifyReply } from 'fastify';

/**
 * Mirrors the Next.js `cacheControl` middleware from
 * `@lidofinance/next-api-wrapper`: sets `Cache-Control` unless the response
 * is an error or already has one; errors get the no-store header.
 *
 * Values are VERBATIM from `config/groups/cache.ts` — the previous PoC port
 * drifted here (different max-age/s-maxage and week-long stale windows).
 */
export const CACHE_DEFAULT_HEADERS =
  'public, max-age=180, stale-if-error=1200, stale-while-revalidate=60';
export const CACHE_REWARDS_HEADERS =
  'public, max-age=30, stale-if-error=1200, stale-while-revalidate=30';
export const CACHE_VALIDATION_HEADERS =
  'public, max-age=30, stale-if-error=1200, stale-while-revalidate=30';
// /api/geo answers differ per visitor IP — a shared cache entry would hand one
// visitor's country to everyone behind the same edge node
export const CACHE_GEO_HEADERS = 'private, no-store, must-revalidate';
export const CACHE_DEFAULT_ERROR_HEADERS = 'no-store, must-revalidate';

export const applyCacheControl = (reply: FastifyReply, value: string): void => {
  if (reply.statusCode >= 400) {
    reply.header('cache-control', CACHE_DEFAULT_ERROR_HEADERS);
    return;
  }
  if (reply.getHeader('cache-control')) return;
  reply.header('cache-control', value);
};
