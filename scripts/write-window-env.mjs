/**
 * CLI runner for build-dynamics.mjs (which exports a function — it used to
 * be invoked from next.config.mjs at config-load time). Writes
 * `public/runtime/window-env.js` from the current process env for local
 * dev / plain builds; in k8s the nginx entrypoint rewrites the file at
 * container start.
 *
 * Also mirrors the k8s delivery of the address blocklist: writes
 * VALIDATION_FILE_PATH to `public/runtime/validation.json` with the
 * addresses SHA256-HASHED — the same transform the helm chart applies at
 * template render time (sprig `sha256sum` over the lowercased address), so
 * the plain list never ships to browsers. Skipped for IPFS builds —
 * ipfsMode never fetches it, and a stale blocklist must not be published
 * into an immutable IPFS bundle.
 *
 * Usage: node --env-file-if-exists=.env.local scripts/write-window-env.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import buildDynamics from './build-dynamics.mjs';

buildDynamics();

const sha256hex = (value) =>
  createHash('sha256').update(value).digest('hex');

const validationFilePath = process.env.VALIDATION_FILE_PATH?.trim();
if (validationFilePath && process.env.IPFS_MODE !== 'true') {
  try {
    const source = JSON.parse(readFileSync(resolve(validationFilePath), 'utf8'));
    const hashed = {
      addresses: (source.addresses ?? []).map((addr) =>
        // already-hashed entries (64 hex) pass through
        /^[0-9a-f]{64}$/i.test(addr) ? addr.toLowerCase() : sha256hex(addr.toLowerCase()),
      ),
    };
    writeFileSync(
      resolve('./public/runtime/validation.json'),
      JSON.stringify(hashed),
    );
    console.info('wrote hashed validation file to public/runtime/validation.json');
  } catch (err) {
    console.warn(
      `validation file not written (${validationFilePath}): ${err.code ?? err}`,
    );
  }
}
