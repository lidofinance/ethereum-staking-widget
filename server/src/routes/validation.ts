import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { isAddress, type Address } from 'viem';

import { validateAddressLocally } from 'utils/address-validation';

import { config } from '../config.js';
import {
  applyCacheControl,
  CACHE_VALIDATION_HEADERS,
} from '../utils/cache-control.js';
import { createCachedProxy } from '../utils/cached-proxy.js';
import { getExternalManifestConfig } from '../utils/external-manifest.js';
import { getValidationFile } from '../utils/validation-file.js';
import { allowAnyOrigin } from '../utils/cors.js';
import { allowOnlyMethod } from '../utils/method-guard.js';

const ROUTE = '/api/validation';

/**
 * Address validation — ported from `pages/api/validation.ts`, with the
 * file fallback moved server-side (it used to live in the SPA's
 * AddressValidationProvider, a Next-era artifact of getStaticProps props).
 *
 * Source order:
 * 1. External service (VALIDATION_SERVICE_BASE_PATH) via cached proxy.
 * 2. On ANY upstream failure — or with no service configured — the
 *    blocklist file (VALIDATION_FILE_PATH): broken file → `isValid: false`
 *    (fail-closed), healthy file → local list check.
 * 3. Neither configured → route 404s (legacy "disabled" behavior).
 * 4. Upstream failed and no file → 502 (the SPA defaults to valid).
 * The served source is exposed as `X-Validation-Source: upstream | file`.
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
 */
export const validationRoute: FastifyPluginAsync = async (fastify) => {
  const upstream = config.VALIDATION_SERVICE_BASE_PATH;
  const fileConfigured = Boolean(config.VALIDATION_FILE_PATH);

  if (!upstream && !fileConfigured) {
    fastify.log.info(
      'validation: no VALIDATION_SERVICE_BASE_PATH and no VALIDATION_FILE_PATH — route returns 404',
    );
    fastify.get(ROUTE, async (_req, reply) => {
      reply.code(404).send();
    });
    // wrong-method contract (405 + Allow) holds even when disabled
    allowOnlyMethod(fastify, ROUTE, ['GET']);
    return;
  }

  const validateByFile = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!fileConfigured) {
      // upstream failed and there is nothing to fall back to;
      // the SPA treats a failed validation request as "valid" by default
      return reply.code(502).send({ error: 'upstream unreachable' });
    }
    const address = (req.query as { address: string }).address as Address;
    const file = await getValidationFile();
    // broken file → reject all (fail-closed)
    const result = file.isBroken
      ? { isValid: false }
      : validateAddressLocally(address, file);
    reply.header('x-validation-source', 'file');
    return reply.send(result);
  };

  const proxy = upstream
    ? createCachedProxy({
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
        fallback: validateByFile,
      })
    : null;

  fastify.get(ROUTE, async (req, reply) => {
    allowAnyOrigin(reply);
    const q = req.query as { address?: unknown };
    if (typeof q.address !== 'string' || !isAddress(q.address)) {
      return reply.code(400).send({
        error: 'Invalid Ethereum address',
        message: 'Address must be a valid Ethereum address format',
      });
    }
    applyCacheControl(reply, CACHE_VALIDATION_HEADERS);
    if (!proxy) {
      // file-only mode (no external service configured)
      return validateByFile(req, reply);
    }
    reply.header('x-validation-source', 'upstream');
    return proxy(req, reply);
  });

  allowOnlyMethod(fastify, ROUTE, ['GET']);
};
