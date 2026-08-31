// load-local-env first: it populates process.env from .env.local, which
// buildClientEnv() reads when the hooks below run.
import './load-local-env';

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

import {
  buildClientEnv,
  serializeClientEnv,
} from '../../config/client-env-manifest';

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
 *    build-time-static it is CSP-hashable at build: closeBundle emits
 *    `window-env-csp-hash.txt` for the nginx entrypoint (mirroring
 *    importmap-csp-hash.txt), and the IPFS CSP meta embeds the same hash —
 *    script EXECUTION stays hash-pinned. (Values in the data element are
 *    correspondingly NOT hash-covered — their integrity rests on the
 *    read-only html volume and the response-time include.)
 */

// The id pins the exact tag for every substituting party (this plugin, the
// loader's getElementById) and for humans inspecting a served page.
export const WINDOW_ENV_TAG_OPEN =
  '<script type="application/json" id="window-env">';
export const WINDOW_ENV_PLACEHOLDER = `${WINDOW_ENV_TAG_OPEN}__WINDOW_ENV__</script>`;

// What the web build ships instead of the payload — nginx SSI fills it in
// at response time (ssi on + the internal /window-env.json location, see
// infra/nginx/default.conf.template).
export const WINDOW_ENV_SSI_INCLUDE =
  '<!--#include virtual="/window-env.json" -->';
const WINDOW_ENV_SSI_ELEMENT = `${WINDOW_ENV_TAG_OPEN}${WINDOW_ENV_SSI_INCLUDE}</script>`;

/**
 * The one executable piece — byte-exact source of the CSP hash, so any
 * change here changes the emitted hash file and the IPFS CSP meta in the
 * same build. If the data element is missing or unpopulated, JSON.parse
 * throws, window.__env__ stays unset and config/dynamics.ts fails closed.
 */
export const WINDOW_ENV_LOADER =
  'window.__env__=JSON.parse(document.getElementById("window-env").textContent)';

const WINDOW_ENV_LOADER_TAG = `<script>${WINDOW_ENV_LOADER}</script>`;

export const WINDOW_ENV_LOADER_CSP_HASH =
  'sha256-' + createHash('sha256').update(WINDOW_ENV_LOADER).digest('base64');

// Payload for the data element (dev/IPFS): the same final-shape JSON the
// window-env CLI prints in k8s — one producer implementation for all modes.
const windowEnvPayload = (): string => serializeClientEnv(buildClientEnv());

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
    // closed on that. Fail the build instead, then emit the loader's CSP
    // hash for the nginx entrypoint.
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
      await writeFile(
        resolve(root, 'dist/window-env-csp-hash.txt'),
        `${WINDOW_ENV_LOADER_CSP_HASH}\n`,
      );
    },
  };
};
