// load-local-env first: it populates process.env from .env.local, which
// buildClientEnv() reads when the hooks below run.
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — fine: CI/docker builds pass env directly
}

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

import { buildAndSerializeClientEnv } from '../../config/client-env-manifest';

import { walkIndexHtml } from './walk-index-html';

/**
 * Runtime env delivery — the "one image, many envs" contract, inline
 * edition. The former mechanism (a stable-URL `/runtime/window-env.js`
 * rewritten per environment) had two structural flaws: the file cached
 * independently of the bundle and skewed against it (new bundle + old env —
 * the missing-`isProd` banner incident), and its content could never be
 * SRI-pinned because it is unknown at build time.
 *
 * The env list, transforms and validation have ONE source of truth:
 * config/client-env-manifest.ts. This plugin only moves the result. Env
 * travels in two inline pieces:
 *
 *  - a DATA element, `<script type="application/json" id="window-env">` —
 *    plain, human-readable JSON carrying the FINAL config shape
 *    (buildClientEnv()), not executable and therefore outside CSP
 *    script-src. Dev serve and IPFS builds get it filled in HERE from the
 *    current process env; the k8s web build instead carries an nginx SSI
 *    include (`<!--#include virtual="/window-env.json" -->`) — the
 *    entrypoint runs the bundled scripts/window-env-cli.ts at boot to
 *    write that file, and nginx splices it into every HTML response
 *    server-side. Env stays atomic with the response (a cached copy is
 *    old-but-consistent) and there is no separately-fetchable artifact;
 *  - a fixed LOADER script (WINDOW_ENV_LOADER below, injected in every
 *    mode) that parses the data element into `window.__env__`. Being
 *    static, its CSP hash is a hardcoded constant — embedded in the IPFS
 *    CSP meta here and in the nginx CSP header by the entrypoint — so
 *    script EXECUTION stays hash-pinned. (Values in the data element are
 *    correspondingly NOT hash-covered — their integrity rests on the
 *    read-only html volume and the response-time include.)
 */

// The id pins the exact tag for every substituting party (this plugin, the
// loader's getElementById) and for humans inspecting a served page.
const WINDOW_ENV_TAG_OPEN = '<script type="application/json" id="window-env">';
export const WINDOW_ENV_PLACEHOLDER = `${WINDOW_ENV_TAG_OPEN}__WINDOW_ENV__</script>`;

// What the web build ships instead of the payload — nginx SSI fills it in
// at response time (ssi on + the internal /window-env.json location, see
// infra/nginx/default.conf.template).
const WINDOW_ENV_SSI_ELEMENT = `${WINDOW_ENV_TAG_OPEN}<!--#include virtual="/window-env.json" --></script>`;

/**
 * The one executable piece — byte-exact source of the CSP hash below.
 * DO NOT change this string without updating BOTH hardcoded hash copies:
 * WINDOW_ENV_LOADER_CSP_HASH here (also embedded in the IPFS CSP meta)
 * and SCRIPT_SRC_EXTRA in infra/nginx/entrypoint.sh — the unit test in
 * config/__tests__/client-env-manifest.test.ts recomputes the hash and
 * fails on any drift. If the data element is missing or unpopulated,
 * JSON.parse throws, window.__env__ stays unset and config/dynamics.ts
 * fails closed.
 */
export const WINDOW_ENV_LOADER =
  'window.__env__=JSON.parse(document.getElementById("window-env").textContent)';

const WINDOW_ENV_LOADER_TAG = `<script>${WINDOW_ENV_LOADER}</script>`;

// sha256(WINDOW_ENV_LOADER), base64 — static because the loader is static.
export const WINDOW_ENV_LOADER_CSP_HASH =
  'sha256-6ApUdZunJlq8fZcraTYQbcZ6XIB1F85yxMoDe+8WwAY=';

// Payload for the data element (dev/IPFS): the same final-shape JSON the
// window-env CLI prints in k8s — one producer implementation for all modes.
const windowEnvPayload = (): string => buildAndSerializeClientEnv();

/**
 * Injects the window-env data element and loader script into every index.html for DEV/IPFS
 * For Prod build, injects loader and SSI include for nginx
 */
export const windowEnvPlugin = (root: string, isIpfs: boolean): Plugin => {
  let isBuild = false;
  return {
    name: 'window-env',
    // post, like emit-import-map-csp-hash: closeBundle must observe the
    // final per-route HTML files after the prerender plugin wrote them.
    enforce: 'post',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (!html.includes(WINDOW_ENV_PLACEHOLDER)) {
          throw new Error(
            `window-env: index.html lost the ${WINDOW_ENV_PLACEHOLDER} placeholder`,
          );
        }
        // Loader goes in right after the data element in EVERY mode — the
        // executable piece has a single source of truth here, next to the
        // hash derived from it.
        const withLoader = html.replace(
          WINDOW_ENV_PLACEHOLDER,
          `${WINDOW_ENV_PLACEHOLDER}\n    ${WINDOW_ENV_LOADER_TAG}`,
        );
        // Web build: swap the placeholder for the SSI include — nginx
        // fills it per environment at response time.
        if (isBuild && !isIpfs) {
          return withLoader.replace(
            WINDOW_ENV_PLACEHOLDER,
            WINDOW_ENV_SSI_ELEMENT,
          );
        }
        // Dev serve / IPFS build: fill in the current process env. The
        // IPFS CSP meta gets the loader hash in ipfs-head-defaults-plugin.
        return withLoader.replace(
          WINDOW_ENV_PLACEHOLDER,
          `${WINDOW_ENV_TAG_OPEN}${windowEnvPayload()}</script>`,
        );
      },
    },
    // Web build: an HTML file without exactly one SSI data element + one
    // loader would be served broken — no env, and config/dynamics.ts fails
    // closed on that. Fail the build instead.
    async closeBundle() {
      if (!isBuild || isIpfs) return;
      const files = await walkIndexHtml(resolve(root, 'dist'));
      if (files.length === 0) {
        throw new Error('window-env: no index.html emitted into dist/');
      }
      for (const file of files) {
        const html = await readFile(file, 'utf-8');
        for (const [what, needle] of [
          ['SSI data element', WINDOW_ENV_SSI_ELEMENT],
          ['loader script', WINDOW_ENV_LOADER_TAG],
        ] as const) {
          const count = html.split(needle).length - 1;
          if (count !== 1) {
            throw new Error(
              `window-env: expected exactly one ${what} in ${file}, found ${count}`,
            );
          }
        }
      }
    },
  };
};
