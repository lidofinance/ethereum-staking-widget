import type { FastifyPluginAsync } from 'fastify';

import { config } from '../config.js';
import {
  applyCacheControl,
  CACHE_REWARDS_HEADERS,
} from '../utils/cache-control.js';
import { createCachedProxy } from '../utils/cached-proxy.js';
import {
  REWARDS_ALLOWED_QUERY_PARAMS,
  rewardsQuerySchema,
} from '../utils/rewards-query-schema.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { ROUTES } from '../consts.js';

/**
 * Ported from `pages/api/rewards.ts` (+ `utilsApi/rewards-handler.ts`).
 *
 * Defenses preserved verbatim:
 * - GET only
 * - Query whitelist (REWARDS_ALLOWED_QUERY_PARAMS) bounds the upstream URL
 *   and the cache key.
 * - Zod schema with `.strict()` rejects unknown keys; `limit ≤ 100`,
 *   `skip ≤ 100_000`, viem `isAddress`. 400 with structured details on
 *   validation failure (incl. the `limit=1000000` bounty PoC).
 * - 1-second LRU cache, max 200 entries; 10s upstream timeout.
 * - `Cache-Control` from config/groups/cache.ts values.
 * - CORS `*` (route-scoped, like the legacy `cors()` wrapper).
 *
 * If REWARDS_BACKEND is not configured the route 404s (same as legacy —
 * disabled in environments that don't need it).
 */
export const rewardsRoute: FastifyPluginAsync = async (fastify) => {
  if (!config.REWARDS_BACKEND) {
    fastify.log.info('rewards: REWARDS_BACKEND not set — route returns 404');
    fastify.get(ROUTES.api.rewards, async (_req, reply) => {
      reply.code(404).send();
    });
    return;
  }

  const proxy = createCachedProxy({
    proxyUrl: config.REWARDS_BACKEND + '/',
    cacheTTL: 1_000,
    allowedQueryParams: REWARDS_ALLOWED_QUERY_PARAMS,
    timeout: 10_000,
  });

  fastify.get(ROUTES.api.rewards, async (req, reply) => {
    allowAnyOrigin(reply);
    const parsed = rewardsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    applyCacheControl(reply, CACHE_REWARDS_HEADERS);
    return proxy(req, reply);
  });
};
