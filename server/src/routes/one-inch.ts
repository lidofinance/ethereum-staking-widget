import type { FastifyPluginAsync } from 'fastify';

import { config } from '../config.js';
import {
  CACHE_DEFAULT_ERROR_HEADERS,
  CACHE_ONE_INCH_RATE_HEADERS,
} from '../utils/cache-control.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { createOneInchRateHandler } from '../utils/one-inch-rate-handler.js';
import { ROUTES } from '../consts.js';

/**
 * Ported from `pages/api/swap/one-inch.ts`: 1inch Fusion quote proxy for the
 * swap-discount banner. GET only, CORS `*`. Without ONE_INCH_API_KEY the
 * route 404s (same as legacy).
 */
export const oneInchRoute: FastifyPluginAsync = async (fastify) => {
  if (!config.ONE_INCH_API_KEY) {
    fastify.log.info('one-inch: ONE_INCH_API_KEY not set — route returns 404');
    fastify.get(ROUTES.api.swapOneInch, async (_req, reply) => {
      allowAnyOrigin(reply);
      reply.code(404).header('cache-control', CACHE_DEFAULT_ERROR_HEADERS);
      return reply.send();
    });
    return;
  }

  const handler = createOneInchRateHandler({
    apiKey: config.ONE_INCH_API_KEY,
  });

  fastify.get(ROUTES.api.swapOneInch, async (req, reply) => {
    allowAnyOrigin(reply);
    // error paths overwrite this with no-store
    reply.header('cache-control', CACHE_ONE_INCH_RATE_HEADERS);
    return handler(req, reply);
  });
};
