/**
 * CLI runner for build-dynamics.mjs (which exports a function — it used to
 * be invoked from next.config.mjs at config-load time). Writes
 * `public/runtime/window-env.js` from the current process env for local
 * dev / plain builds; in k8s the nginx entrypoint rewrites the file at
 * container start.
 *
 * Usage: node --env-file-if-exists=.env.local scripts/write-window-env.mjs
 */
import buildDynamics from './build-dynamics.mjs';

buildDynamics();
