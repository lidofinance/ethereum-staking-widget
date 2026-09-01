/**
 * Dev/local mirror of the k8s delivery of the address blocklist: writes
 * VALIDATION_FILE_PATH to `public/runtime/validation.json` with the
 * addresses SHA256-HASHED — the same transform the helm chart applies at
 * template render time (sprig `sha256sum` over the lowercased address), so
 * the plain list never ships to browsers. Skipped for IPFS builds —
 * ipfsMode never fetches it, and a stale blocklist must not be published
 * into an immutable IPFS bundle.
 *
 *
 * Usage: node --env-file-if-exists=.env.local scripts/write-validation-file.mjs
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const sha256hex = (value) => createHash('sha256').update(value).digest('hex');

const validationFilePath = process.env.VALIDATION_FILE_PATH?.trim();
if (validationFilePath && process.env.IPFS_MODE !== 'true') {
  try {
    const source = JSON.parse(
      readFileSync(resolve(validationFilePath), 'utf8'),
    );
    const hashed = {
      addresses: (source.addresses ?? []).map((addr) =>
        // already-hashed entries (64 hex) pass through
        /^[0-9a-f]{64}$/i.test(addr)
          ? addr.toLowerCase()
          : sha256hex(addr.toLowerCase()),
      ),
    };
    const outPath = resolve('./public/runtime/validation.json');
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(hashed));
    console.info(
      'wrote hashed validation file to public/runtime/validation.json',
    );
  } catch (err) {
    console.warn(
      `validation file not written (${validationFilePath}): ${err.code ?? err}`,
    );
  }
}
