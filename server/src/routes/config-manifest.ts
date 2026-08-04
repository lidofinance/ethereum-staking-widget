import type { FastifyPluginAsync } from 'fastify';

import {
  fetchExternalManifest,
  getLastManifestSource,
} from '../utils/external-manifest.js';
import { applyCacheControl } from '../utils/cache-control.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { methodNotAllowed } from '../utils/method-guard.js';

/**
 * Serves the config manifest from the same source the server itself reads:
 * the CONFIG_MANIFEST_PATH file or the cached remote manifest — port of
 * `pages/api/config-manifest.ts`. The SPA fetches this route instead of
 * github raw when `useConfigManifestFile` is set (window.__env__).
 */

// CACHE_EXTERNAL_MANIFEST_HEADERS from config/groups/cache.ts
const CACHE_EXTERNAL_MANIFEST_HEADERS =
  'public, max-age=60, stale-if-error=1200, stale-while-revalidate=30';

export const configManifestRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/config-manifest', async (_req, reply) => {
    allowAnyOrigin(reply);
    const manifest = await fetchExternalManifest();
    // lets probes distinguish a degraded manifest from a healthy one
    reply.header('x-manifest-source', getLastManifestSource());
    applyCacheControl(reply, CACHE_EXTERNAL_MANIFEST_HEADERS);
    return manifest;
  });

  methodNotAllowed(fastify, '/api/config-manifest', ['GET']);
};
