import { promises as fs } from 'node:fs';

import { config } from '../config.js';
import metrics from '../metrics/index.js';
import { maskedError } from './masked-error.js';

/**
 * Address-validation blocklist file loader (VALIDATION_FILE_PATH, e.g. a
 * k8s configmap). Consumed by /api/validation as the fallback source when
 * the external validation service is unreachable — or as the only source
 * when no service is configured.
 *
 * Semantics preserved from the legacy `loadValidationFile`:
 * - no path configured → `{ addresses: [] }`
 * - empty file → `{ addresses: [] }`
 * - unreadable / invalid format → `{ addresses: [], isBroken: true }`
 *   (+ `validation_file_load_error` metric) — a broken file means
 *   "reject all" (fail-closed).
 *
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
    console.error('[validation-file] Failed to load:', maskedError(error));
    // bounded label: errno code, not the raw message (label cardinality)
    metrics.request.validationFileLoadError
      .labels({
        error:
          (error as NodeJS.ErrnoException | null)?.code ??
          (error instanceof SyntaxError ? 'invalid_json' : 'read_failed'),
      })
      .inc(1);
    return { addresses: [], isBroken: true };
  }
};

let cached: { value: AddressValidationFile; at: number } | null = null;

export const getValidationFile = async (): Promise<AddressValidationFile> => {
  const now = Date.now();
  if (!cached || now - cached.at >= CACHE_TTL_MS) {
    cached = { value: await loadValidationFile(), at: now };
  }
  return cached.value;
};
