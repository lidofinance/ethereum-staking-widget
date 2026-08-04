import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Dev-only `.env.local` loader. Zero-dep, ~30 lines — replaces both
 * `@next/env` and the `dotenv` package so we don't add another
 * supply-chain surface.
 *
 * Behaviour:
 * - Reads `<repo-root>/.env.local` if present; silently no-ops if absent
 *   (production case: k8s injects env via Vault Agent, no file on disk).
 * - Does NOT overwrite existing `process.env` entries — env from the shell
 *   / k8s container always wins. This makes the loader safe to import
 *   unconditionally.
 * - Imported as the FIRST thing in `index.ts` so any module reading env
 *   at import time (e.g. `config.ts` Zod parse) sees the populated state.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
// server/src → repo root /.env.local (works from dist/ too: esbuild bundles
// to server/dist/index.js, one level up is still inside server/ — so probe
// both candidates).
const CANDIDATES = [
  resolve(__dirname, '../../.env.local'),
  resolve(__dirname, '../.env.local'),
];

const stripQuotes = (value: string): string => {
  if (value.length < 2) return value;
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }
  return value;
};

for (const envPath of CANDIDATES) {
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (!key) continue;
      if (key in process.env) continue; // shell/container env wins
      process.env[key] = stripQuotes(line.slice(eq + 1).trim());
    }
    break; // first found file wins
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException | undefined)?.code;
    if (code !== 'ENOENT') {
      console.warn(`load-env: failed to read ${envPath}:`, err);
    }
  }
}

// A relative CONFIG_MANIFEST_PATH means "relative to the repo root" (parity
// with develop, where the Next server ran from the repo root) — NOT to the
// api process cwd (server/ in dev, /app/server in the image). Normalize once
// here, before any consumer reads it (config.ts Zod parse, the startup-check
// module, external-manifest). `../..` from this file is the repo root in
// both layouts: server/src → repo root, /app/server/dist → /app. Absolute
// paths (the k8s configmap mount case) pass through untouched.
const manifestPath = process.env.CONFIG_MANIFEST_PATH?.trim();
if (manifestPath && !isAbsolute(manifestPath)) {
  process.env.CONFIG_MANIFEST_PATH = resolve(__dirname, '../..', manifestPath);
}
