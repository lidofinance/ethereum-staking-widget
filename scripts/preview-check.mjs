/**
 * Preflight for `yarn preview`: a production-shaped local run serves the
 * REAL build artifacts, so refuse to start when either is missing instead
 * of letting vite preview serve nothing and the api crash on a missing
 * module. Prints each artifact's age — preview never rebuilds, so a stale
 * dist silently masquerades as "current code" otherwise.
 */
import { statSync } from 'node:fs';

const required = {
  'dist/index.html': 'yarn build:web',
  'server/dist/index.js': 'yarn workspace api build',
};

let ok = true;
for (const [file, fix] of Object.entries(required)) {
  try {
    const ageMin = Math.round((Date.now() - statSync(file).mtimeMs) / 60_000);
    console.info(`preview: ${file} found (built ${ageMin} min ago)`);
  } catch {
    console.error(`preview: ${file} missing — run \`${fix}\` first`);
    ok = false;
  }
}
if (!ok) process.exit(1);
