import { promises as fs } from 'node:fs';
import type { FastifyPluginAsync } from 'fastify';

import { config } from '../config.js';
import metrics from '../metrics/index.js';
import { methodNotAllowed } from '../utils/method-guard.js';

/**
 * Serves the address-validation blocklist file to the SPA.
 *
 * In the Next.js app this file was read from the pod FS in
 * `getStaticProps` (`utilsApi/load-validation-file.ts`) and injected as a
 * page prop. The SPA has no build-time props, so the frontend
 * (`providers/address-validation-provider.tsx`) fetches it from here at
 * runtime instead.
 *
 * Semantics preserved from `loadValidationFile`:
 * - no path configured → `{ addresses: [] }`
 * - empty file → `{ addresses: [] }`
 * - unreadable / invalid format → `{ addresses: [], isBroken: true }`
 *   (+ `validation_file_load_error` metric) — the client treats a broken
 *   file as "reject all" (fail-closed).
 *
 * Always 200: availability of the endpoint must not depend on file health.
 * Content re-read at most once a minute (the file only changes on
 * redeploy/config-map update).
 */
export interface AddressValidationFile {
  addresses: string[];
  isBroken?: boolean;
}

const CACHE_TTL_MS = 60_000;

const isValidValidationFile = (
  data: unknown,
): data is AddressValidationFile => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'addresses' in data &&
    Array.isArray(data.addresses) &&
    (data as { addresses: unknown[] }).addresses.every(
      (addr) => typeof addr === 'string',
    )
  );
};

const loadValidationFile = async (): Promise<AddressValidationFile> => {
  const path = config.VALIDATION_FILE_PATH;
  if (!path) {
    return { addresses: [] };
  }

  try {
    const raw = await fs.readFile(path, 'utf8');
    if (raw.trim() === '') {
      return { addresses: [] };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidValidationFile(parsed)) {
      console.error(
        '[validation-file] Invalid format. Expected: { addresses: string[] }',
      );
      metrics.request.validationFileLoadError
        .labels({ error: 'invalid_format' })
        .inc(1);
      return { addresses: [], isBroken: true };
    }
    return parsed;
  } catch (error) {
    console.error('[validation-file] Failed to load:', error);
    metrics.request.validationFileLoadError
      .labels({ error: String(error) })
      .inc(1);
    return { addresses: [], isBroken: true };
  }
};

export const validationFileRoute: FastifyPluginAsync = async (fastify) => {
  let cached: { value: AddressValidationFile; at: number } | null = null;

  fastify.get('/api/validation-file', async (_req, reply) => {
    const now = Date.now();
    if (!cached || now - cached.at >= CACHE_TTL_MS) {
      cached = { value: await loadValidationFile(), at: now };
    }
    reply.header('cache-control', 'public, max-age=60');
    return cached.value;
  });

  methodNotAllowed(fastify, '/api/validation-file', ['GET']);
};
