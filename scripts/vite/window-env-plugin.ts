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

import { parseHtml } from './parse-html';
import { walkIndexHtml } from './walk-index-html';

/**
 * Runtime env delivery — the "one image, many envs" contract.
 *
 * index.html ships the PROD form: a non-executable data element carrying
 * an nginx SSI include (spliced with JSON at response time — env stays
 * atomic with the HTML, no separately-cacheable artifact) plus the fixed
 * loader script that parses it into window.__env__. The web build passes
 * through UNTOUCHED; this plugin only:
 *  - dev serve / IPFS build: swaps the SSI include for inline JSON from
 *    the current process env (same producer as the k8s window-env CLI:
 *    config/client-env-manifest.ts);
 *  - web build: validates every emitted HTML still carries exactly one
 *    data element and one loader (config/dynamics.ts fails closed on a
 *    broken page — fail the build instead).
 */

const WINDOW_ENV_TAG_OPEN = '<script type="application/json" id="window-env">';

// Must match index.html byte-for-byte — the swap is an exact-string
// replace on our own authored sentinel (a miss throws, never corrupts).
export const WINDOW_ENV_SSI_ELEMENT = `${WINDOW_ENV_TAG_OPEN}<!--#include virtual="/window-env.json" --></script>`;

// sha256 of the loader script's content (inline in index.html). Hardcoded
// here (→ IPFS CSP meta) and in infra/nginx/entrypoint.sh (→ web CSP
// header); the unit test recomputes it from index.html and fails on drift.
export const WINDOW_ENV_LOADER_CSP_HASH =
  'sha256-6ApUdZunJlq8fZcraTYQbcZ6XIB1F85yxMoDe+8WwAY=';

const isWindowEnvData = (el: {
  getAttribute: (n: string) => string | undefined;
}) => el.getAttribute('id') === 'window-env';

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
        if (!html.includes(WINDOW_ENV_SSI_ELEMENT)) {
          throw new Error(
            `window-env: index.html lost the ${WINDOW_ENV_SSI_ELEMENT} element`,
          );
        }
        // Web build ships the SSI form as-is.
        if (isBuild && !isIpfs) return html;
        // Dev serve / IPFS build: inline the current process env.
        return html.replace(
          WINDOW_ENV_SSI_ELEMENT,
          `${WINDOW_ENV_TAG_OPEN}${buildAndSerializeClientEnv()}</script>`,
        );
      },
    },
    async closeBundle() {
      if (!isBuild || isIpfs) return;
      const files = await walkIndexHtml(resolve(root, 'dist'));
      if (files.length === 0) {
        throw new Error('window-env: no index.html emitted into dist/');
      }
      for (const file of files) {
        const html = await readFile(file, 'utf-8');
        const scripts = parseHtml(html).querySelectorAll('script');
        const dataElements = scripts.filter(isWindowEnvData);
        const loaders = scripts.filter((el) =>
          el.innerHTML.startsWith('window.__env__='),
        );
        if (
          dataElements.length !== 1 ||
          dataElements[0].innerHTML.trim() !==
            '<!--#include virtual="/window-env.json" -->' ||
          loaders.length !== 1
        ) {
          throw new Error(
            `window-env: ${file} must carry exactly one SSI data element and one loader (got ${dataElements.length}/${loaders.length})`,
          );
        }
      }
    },
  };
};
