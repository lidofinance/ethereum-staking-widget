import { LRUCache } from 'lru-cache';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { CACHE_DEFAULT_ERROR_HEADERS } from './cache-control.js';

const DEFAULT_CACHE_MAX_ENTRIES = 200;
// Full rewards histories reach several MB each: a count cap alone let 200 of
// them pin the heap of the one server process
const DEFAULT_CACHE_MAX_BYTES = 32 * 1024 * 1024;
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
  /** Hard cap on cached bytes (serialized). Larger bodies are served uncached. Default 32MB. */
  cacheMaxBytes?: number;
  /** Extra upstream headers from the request; cache hits don't reach upstream. */
  forwardHeaders?: (req: FastifyRequest) => Record<string, string>;
  /**
   * Called instead of the error response on ANY upstream failure (4xx, 5xx,
   * network) — lets a route serve a local fallback (e.g. /api/validation →
   * blocklist file). The hook owns the reply.
   */
  fallback?: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
}

class UpstreamStatusError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
  ) {
    super(`upstream responded ${status}`);
  }
}

/**
 * Ported from `utilsApi/cached-proxy.ts`. Same caching semantics
 * (per-key LRU bounded by entries and serialized bytes, TTL autopurge,
 * concurrent misses of one key share one upstream fetch) and same query
 * whitelist (bounded cache keyspace — vault note F8, known-issues 2026-05-14).
 *
 * Upstream URLs may embed secrets — log lines here rely on the process-wide
 * satanizer mask (`src/logger.ts`) to scrub them.
 *
 * Differences from the Next.js original:
 * - Fastify req/reply instead of NextApiRequest/Response.
 * - Global fetch (Node 20+) instead of `standardFetcher`.
 * - 4xx upstream errors are forwarded with the same status; 5xx → 502.
 *   Error replies carry no-store: the route set public caching before the
 *   proxy ran.
 *
 * Error bodies use the `error` key, NEVER `message`: the SPA's
 * extractErrorMessage() only surfaces `.message` into user-facing text, so
 * proxy internals ("upstream unreachable") stay out of the UI while the
 * status-based branches (422/429/503 in rewards error blocks) keep working.
 */
export const createCachedProxy = (opts: CachedProxyOptions) => {
  const cache = new LRUCache<string, string>({
    max: opts.cacheMaxEntries ?? DEFAULT_CACHE_MAX_ENTRIES,
    maxSize: opts.cacheMaxBytes ?? DEFAULT_CACHE_MAX_BYTES,
    sizeCalculation: (value) => Math.max(Buffer.byteLength(value), 1),
    ttl: opts.cacheTTL,
    // Without this an expired entry stays in memory until its key is read
    // again or the cache is full
    ttlAutopurge: true,
  });
  // Concurrent misses of one key share a single upstream fetch. Entries live
  // only while the fetch runs, so a failed fetch is not remembered.
  const inFlight = new Map<string, Promise<string>>();
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
    const sendJson = (body: string) =>
      reply.type('application/json; charset=utf-8').send(body);

    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return sendJson(cached);
    }

    const fullUrl = url + (params ? `?${params.toString()}` : '');

    const fetchBody = async (): Promise<string> => {
      // set() is case-insensitive, so forwarded headers can't override these
      const headers = new Headers(opts.forwardHeaders?.(req));
      headers.set('accept', 'application/json');
      headers.set('content-type', 'application/json');

      // one bound for headers and body; cleared so no timer outlives the fetch
      const controller = new AbortController();
      const timer = setTimeout(
        () =>
          controller.abort(
            new DOMException(
              `Request timed out after ${timeout} ms`,
              'TimeoutError',
            ),
          ),
        timeout,
      );
      try {
        const res = await fetch(fullUrl, {
          signal: controller.signal,
          headers,
        });
        if (!res.ok) throw new UpstreamStatusError(res.status, res.statusText);

        const data = (await res.json()) as unknown;
        const body = JSON.stringify(transform(data) ?? data);
        cache.set(cacheKey, body);
        return body;
      } finally {
        clearTimeout(timer);
      }
    };

    try {
      const shared = inFlight.get(cacheKey);
      let body: string;
      if (!shared) {
        const pending = fetchBody().finally(() => inFlight.delete(cacheKey));
        inFlight.set(cacheKey, pending);
        body = await pending;
      } else if (opts.forwardHeaders) {
        // A shared 429 may belong to the first caller's IP. Other failures
        // are shared without retrying against an unavailable upstream.
        body = await shared.catch((error: unknown) => {
          if (error instanceof UpstreamStatusError && error.status === 429) {
            return fetchBody();
          }
          throw error;
        });
      } else {
        body = await shared;
      }
      return sendJson(body);
    } catch (err) {
      if (err instanceof UpstreamStatusError) {
        if (err.status >= 400 && err.status < 500) {
          req.log.warn(
            { upstreamUrl: fullUrl, status: err.status },
            'cached-proxy: forwarding 4xx',
          );
          if (opts.fallback) return opts.fallback(req, reply);
          return sendError(reply, err.status, { error: err.statusText });
        }
        req.log.error(
          { upstreamUrl: fullUrl, status: err.status },
          'cached-proxy: upstream 5xx',
        );
        if (opts.fallback) return opts.fallback(req, reply);
        return sendError(reply, 502, { error: 'upstream error' });
      }
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
      return sendError(reply, 502, {
        error: 'upstream unreachable',
        ...(code ? { code } : {}),
      });
    }
  };
};

const sendError = (reply: FastifyReply, status: number, body: object) =>
  reply
    .code(status)
    .header('cache-control', CACHE_DEFAULT_ERROR_HEADERS)
    .send(body);

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
