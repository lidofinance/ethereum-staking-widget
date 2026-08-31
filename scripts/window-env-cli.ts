/**
 * Prints the window-env JSON — the final, validated client config shape —
 * from the current process env (config/client-env-manifest.ts is the
 * single source of truth for sources, transforms and invariants).
 *
 * Runs in the nginx web container at boot: esbuild-bundles to a
 * self-contained dist-node/window-env-cli.mjs (`yarn build:window-env-cli`,
 * part of build:web), copied into the image and invoked by
 * infra/nginx/entrypoint.sh, which writes the output to the file nginx SSI
 * splices into every HTML response. A config error (duplicate
 * SUPPORTED_CHAINS, DEFAULT_CHAIN not first, …) exits non-zero here and
 * kills the pod at boot — misconfiguration never reaches a browser.
 */
import {
  buildClientEnv,
  serializeClientEnv,
} from '../config/client-env-manifest';

try {
  process.stdout.write(serializeClientEnv(buildClientEnv(process.env)));
} catch (err) {
  console.error(
    'window-env-cli: refusing to emit runtime env:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}
