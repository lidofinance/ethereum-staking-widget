import {
  buildClientEnv,
  parseClientEnv,
  type ClientEnv,
} from './client-env-manifest';

/**
 * Runtime env source — the "one image, many envs" contract.
 *
 * `window.__env__` is set by the fixed loader script from the window-env
 * JSON data element in the HTML (see scripts/vite/window-env-plugin.ts).
 * The JSON already carries the FINAL config shape — transformed and
 * validated by config/client-env-manifest.ts at the point it was produced
 * (nginx entrypoint CLI in k8s, the vite plugin in dev/IPFS) — so there is
 * nothing to normalize here. Where there is no window at all (vitest node
 * env, the api bundle), buildClientEnv() derives the same shape straight
 * from process.env.
 */

// NOTE: Window.__env__ is declared globally by @lidofinance/analytics-matomo.

// Fail closed on web production builds: a missing window.__env__ means the
// window-env data element was never populated (served outside the nginx
// SSI, or tampered with). The silent alternative is booting on the
// manifest's TESTNET fallbacks — worse than a hard failure. Dev and vitest
// (PROD=false) keep the fallback; IPFS builds inline the env statically at
// build time, so absence there is not a runtime condition.
// `?.`: the api's esbuild bundle also evaluates this module in plain Node,
// where import.meta.env does not exist at all (and the short-circuit keeps
// the vite-only __IPFS_MODE__ identifier unevaluated there).
if (
  import.meta.env?.PROD &&
  !__IPFS_MODE__ &&
  typeof window !== 'undefined' &&
  !window.__env__
) {
  throw new Error(
    'Runtime env missing: the window-env data element was not populated',
  );
}

// Don't use dynamics directly in the project!
// Only through:
// code```
//    import { config } from 'config'; // or
//    import { config } from './get-config'; // in config "namespace"
// ```
// parseClientEnv, not a cast: the injected JSON is re-validated against
// the same schema its producer used — a tampered, corrupt or
// shape-drifted payload throws here (fail closed) instead of propagating
// garbage into the app.
const dynamics: ClientEnv =
  typeof window !== 'undefined' && window.__env__
    ? parseClientEnv(window.__env__)
    : buildClientEnv();

export default dynamics;
