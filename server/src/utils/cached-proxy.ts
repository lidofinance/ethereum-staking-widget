import { LRUCache } from 'lru-cache';
import type { FastifyReply, FastifyRequest } from 'fastify';

const DEFAULT_CACHE_MAX_ENTRIES = 200;
const DEFAULT_TIMEOUT_MS = 5_000;

export interface CachedProxyOptions {
  /** Upstream URL or async builder. Builder receives the request for path-based routing (e.g. /validation/check/:addr). */
  proxyUrl: string | ((req: FastifyRequest) => Promise<string> | string);
  cacheTTL: number;
  timeout?: number;
  /** Skip query parsing entirely (e.g. when params are encoded in the path). */
  ignoreParams?: boolean;
  /** Whitelist of query keys allowed into the cache key + upstream URL. Unset = all. */
  allowedQueryParams?: string[];
  transformData?: (data: unknown) => unknown;
  /** Hard cap on cache entries. Default 200. Bounds memory. */
  cacheMaxEntries?: number;
  /**
   * Called instead of the error response on ANY upstream failure (4xx, 5xx,
   * network) — lets a route serve a local fallback (e.g. /api/validation →
   * blocklist file). The hook owns the reply.
   */
  fallback?: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
}

/**
 * Ported from `utilsApi/cached-proxy.ts`. Same caching semantics
 * (per-key LRU, bounded entries) and same query whitelist (bounded cache
 * keyspace — vault note F8, known-issues 2026-05-14).
 *
 * Upstream URLs may embed secrets — log lines here rely on the process-wide
 * satanizer mask (`src/logger.ts`) to scrub them.
 *
 * Differences from the Next.js original:
 * - Fastify req/reply instead of NextApiRequest/Response.
 * - Global fetch (Node 20+) instead of `standardFetcher`.
 * - 4xx upstream errors are forwarded with the same status; 5xx → 502.
 *
 * Error bodies use the `error` key, NEVER `message`: the SPA's
 * extractErrorMessage() only surfaces `.message` into user-facing text, so
 * proxy internals ("upstream unreachable") stay out of the UI while the
 * status-based branches (422/429/503 in rewards error blocks) keep working.
 */
export const createCachedProxy = (opts: CachedProxyOptions) => {
  const cache = new LRUCache<string, object>({
    max: opts.cacheMaxEntries ?? DEFAULT_CACHE_MAX_ENTRIES,
    ttl: opts.cacheTTL,
  });
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT_MS;
  const transform = opts.transformData ?? ((d: unknown) => d);

  return async function proxy(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<unknown> {
    const params = buildParams(
      req.query as Record<string, unknown>,
      opts.ignoreParams,
      opts.allowedQueryParams,
    );

    const url =
      typeof opts.proxyUrl === 'function'
        ? await opts.proxyUrl(req)
        : opts.proxyUrl;

    const cacheKey = `${url}-${params?.toString() ?? ''}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return reply.send(cached);
    }

    const fullUrl = url + (params ? `?${params.toString()}` : '');

    try {
      const res = await fetch(fullUrl, {
        signal: AbortSignal.timeout(timeout),
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          req.log.warn(
            { upstreamUrl: fullUrl, status: res.status },
            'cached-proxy: forwarding 4xx',
          );
          if (opts.fallback) return opts.fallback(req, reply);
          return reply.code(res.status).send({ error: res.statusText });
        }
        req.log.error(
          { upstreamUrl: fullUrl, status: res.status },
          'cached-proxy: upstream 5xx',
        );
        if (opts.fallback) return opts.fallback(req, reply);
        return reply.code(502).send({ error: 'upstream error' });
      }

      const data = (await res.json()) as unknown;
      const transformed = transform(data) ?? data;
      if (transformed !== null && typeof transformed === 'object') {
        cache.set(cacheKey, transformed);
      }
      return reply.send(transformed);
    } catch (err) {
      // undici wraps the real reason into a generic "fetch failed"; the
      // errno code (ENOTFOUND, ECONNREFUSED, …) hides in `cause`. Surface
      // it — bounded and secret-free — in the log AND the reply body.
      const cause = (err as { cause?: NodeJS.ErrnoException })?.cause;
      const code =
        cause?.code ??
        (err instanceof Error && err.name === 'TimeoutError'
          ? 'UPSTREAM_TIMEOUT'
          : undefined);
      req.log.error(
        { err, cause, code, upstreamUrl: fullUrl },
        'cached-proxy: failed',
      );
      if (opts.fallback) return opts.fallback(req, reply);
      return reply
        .code(502)
        .send({ error: 'upstream unreachable', ...(code ? { code } : {}) });
    }
  };
};

/**
 * Ported from `utilsApi/cached-proxy-build-params.ts`.
 * When `allowedQueryParams` is set, any other key is dropped — keeps the cache
 * keyspace bounded AND the upstream URL deterministic.
 */
export const buildParams = (
  query: Record<string, unknown>,
  ignoreParams: boolean | undefined,
  allowedQueryParams: string[] | undefined,
): URLSearchParams | null => {
  if (ignoreParams) return null;

  const entries = Object.entries(query).filter(
    ([k, v]) =>
      typeof v === 'string' &&
      (!allowedQueryParams || allowedQueryParams.includes(k)),
  );
  if (entries.length === 0) return null;

  const params = new URLSearchParams();
  for (const [k, v] of entries) {
    params.set(k, v as string);
  }
  return params;
};
