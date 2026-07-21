import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { isAddress } from 'viem';

import { config } from '../config.js';
import {
  applyCacheControl,
  CACHE_VALIDATION_HEADERS,
} from '../utils/cache-control.js';
import { createCachedProxy } from '../utils/cached-proxy.js';
import { getExternalManifestConfig } from '../utils/external-manifest.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { methodNotAllowed } from '../utils/method-guard.js';

/**
 * Address-validation proxy — ported from `pages/api/validation.ts`.
 *
 * Defenses preserved:
 * - Address is viem-`isAddress`-validated BEFORE interpolation into the
 *   upstream URL (SSRF via path injection). Anything else → 400.
 * - API version comes from the external manifest's `api.validation.version`
 *   (default '1') — the same `getExternalConfig()` source the legacy route
 *   used (the PoC port drifted to a MANIFEST_OVERRIDE-as-URL scheme).
 * - GET only (405 otherwise), 10s upstream timeout, 1s LRU cache.
 * - `ignoreParams: true` — the address travels in the path; nothing else is
 *   forwarded upstream.
 *
 * If VALIDATION_SERVICE_BASE_PATH is not set the route 404s.
 */
export const validationRoute: FastifyPluginAsync = async (fastify) => {
  if (!config.VALIDATION_SERVICE_BASE_PATH) {
    fastify.log.info(
      'validation: VALIDATION_SERVICE_BASE_PATH not set — route returns 404',
    );
    fastify.get('/api/validation', async (_req, reply) => {
      reply.code(404).send();
    });
    return;
  }

  const upstream = config.VALIDATION_SERVICE_BASE_PATH;

  const proxy = createCachedProxy({
    proxyUrl: async (req: FastifyRequest) => {
      const manifestConfig = await getExternalManifestConfig();
      const version = manifestConfig?.api?.validation?.version ?? '1';
      const q = req.query as { address?: string };
      const addr = q.address;
      if (!addr || !isAddress(addr)) {
        // Should be caught earlier in the handler; defensive guard here.
        throw new Error('invalid address');
      }
      return `${upstream}/v${version}/check/${addr.toLowerCase()}`;
    },
    cacheTTL: 1_000,
    ignoreParams: true,
    timeout: 10_000,
  });

  fastify.get('/api/validation', async (req, reply) => {
    allowAnyOrigin(reply);
    const q = req.query as { address?: unknown };
    if (typeof q.address !== 'string' || !isAddress(q.address)) {
      return reply.code(400).send({
        error: 'Invalid Ethereum address',
        message: 'Address must be a valid Ethereum address format',
      });
    }
    applyCacheControl(reply, CACHE_VALIDATION_HEADERS);
    return proxy(req, reply);
  });

  methodNotAllowed(fastify, '/api/validation', ['GET']);
};
