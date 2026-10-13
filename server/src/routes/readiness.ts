import type { FastifyPluginAsync } from 'fastify';

import { getReadiness } from '../../../scripts/readiness.mjs';
import { ROUTES } from '../consts.js';

/**
 * Ported from `pages/api/readiness.ts`. k8s readiness target: unlike
 * /api/health (liveness) it is 503 until listen() completes and again as soon
 * as shutdown begins (scripts/shutdown.mjs), so traffic drains first.
 */
export const readinessRoute: FastifyPluginAsync = async (fastify) => {
  // kubelet probes share the node-IP rate-limit bucket — a 429 would flap readiness
  fastify.get(
    ROUTES.api.readiness,
    { config: { rateLimit: false } },
    async (_req, reply) => {
      const { ready, reason } = getReadiness();
      return reply
        .code(ready ? 200 : 503)
        .header('cache-control', 'no-store')
        .send({
          status: ready ? 'ready' : 'not-ready',
          ...(reason ? { reason } : {}),
        });
    },
  );
};
