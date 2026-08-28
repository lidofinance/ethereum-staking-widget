/**
 * Side-effect import: bring `.env.local` into process.env for code running
 * inside the Vite process itself (vite.config.ts plugins) — the same thing
 * `node --env-file-if-exists=.env.local` does for the CLI scripts. Vite
 * loads .env files only into the client-side `import.meta.env` (VITE_-
 * prefixed) and never populates process.env, but env-dynamics.mjs snapshots
 * process.env at module init — so this module MUST be imported before it
 * (import declaration order is evaluation order within a module).
 *
 * Real environment variables take precedence over the file — verified
 * `process.loadEnvFile` semantics, matching `--env-file` — so inline
 * overrides like `IPFS_MODE=true vite dev` still win.
 */
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — fine: CI/docker builds pass env directly
}
