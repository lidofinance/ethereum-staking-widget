// Evaluation order is load-bearing: load-local-env populates process.env
// from .env.local before env-dynamics.mjs snapshots it at module init.
import './load-local-env';

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

import * as dynamics from '../../env-dynamics.mjs';

import { walkIndexHtml } from './walk-index-html';

/**
 * Runtime env delivery — the "one image, many envs" contract, inline
 * edition. The former mechanism (a stable-URL `/runtime/window-env.js`
 * rewritten per environment) had two structural flaws: the file cached
 * independently of the bundle and skewed against it (new bundle + old env —
 * the missing-`isProd` banner incident), and its content could never be
 * SRI-pinned because it is unknown at build time.
 *
 * Instead the env travels in TWO inline pieces, split so that nothing
 * executable is generated at container boot:
 *
 *  - a DATA element, `<script type="application/json" id="window-env">` —
 *    not executable, exempt from CSP script-src by construction. Its
 *    `__WINDOW_ENV__` placeholder content is replaced with base64(JSON):
 *    in dev serve and IPFS builds HERE (from `.env.local` via
 *    load-local-env, or the literal environment); in the k8s web image at
 *    response time by nginx `sub_filter` (infra/nginx/entrypoint.sh) —
 *    env stays atomic with the HTML response, a cached copy is
 *    old-but-consistent, never a new-bundle/old-env mix;
 *  - a fixed LOADER script (WINDOW_ENV_LOADER below, injected by this
 *    plugin in every mode) that parses the data element into
 *    `window.__env__`. Being build-time-static it is CSP-hashable at
 *    build: closeBundle emits `window-env-csp-hash.txt` for the nginx
 *    entrypoint (mirroring importmap-csp-hash.txt), and the IPFS CSP meta
 *    embeds the same hash — so the runtime image needs no hashing tools
 *    at boot, and script EXECUTION stays hash-pinned. (Values in the data
 *    element are correspondingly NOT hash-covered — their integrity rests
 *    on the read-only html volume and response-time substitution.)
 */

// The id pins the exact tag for every substituting party (nginx sub_filter,
// this plugin, the loader's getElementById) and for humans inspecting a
// served page.
export const WINDOW_ENV_TAG_OPEN =
  '<script type="application/json" id="window-env">';
export const WINDOW_ENV_PLACEHOLDER = `${WINDOW_ENV_TAG_OPEN}__WINDOW_ENV__</script>`;

/**
 * The one executable piece — byte-exact source of the CSP hash, so any
 * change here changes the emitted hash file and the IPFS CSP meta in the
 * same build. If the data element is missing or unsubstituted, atob()/
 * getElementById throws, window.__env__ stays unset and config/dynamics.ts
 * fails closed.
 */
export const WINDOW_ENV_LOADER =
  'window.__env__=JSON.parse(atob(document.getElementById("window-env").textContent.trim()))';

const WINDOW_ENV_LOADER_TAG = `<script>${WINDOW_ENV_LOADER}</script>`;

export const WINDOW_ENV_LOADER_CSP_HASH =
  'sha256-' + createHash('sha256').update(WINDOW_ENV_LOADER).digest('base64');

/**
 * env-dynamics.mjs exports `prefillUnsafeElRpcUrls` as a nested
 * `{chainId: urls[]}` map, but `config/dynamics.ts` `normalize()` reads the
 * flat `prefillUnsafeElRpcUrls<chainId>` keys the k8s entrypoint emits (the
 * legacy build-dynamics.mjs wrote the nested shape, so dev silently lost
 * the prefill RPC urls). Flatten to the one true shape.
 */
const flatEnv = (): Record<string, unknown> => {
  const { prefillUnsafeElRpcUrls, ...rest } = dynamics;
  return {
    ...rest,
    ...Object.fromEntries(
      Object.entries(prefillUnsafeElRpcUrls).map(([chainId, urls]) => [
        `prefillUnsafeElRpcUrls${chainId}`,
        urls,
      ]),
    ),
  };
};

/**
 * The data-element payload. Shape is mirrored by `WINDOW_ENV_B64` in
 * infra/nginx/entrypoint.sh — change both together.
 *
 * The JSON travels base64-wrapped so the bytes are alphabet-safe
 * ([A-Za-z0-9+/=]) through every layer they cross in the k8s path (sed
 * render → nginx config string → sub_filter → HTML): no escaping tower,
 * nothing for nginx string parsing, sub_filter `$var` interpolation, or
 * HTML (`</script>`) to trip on. Non-ASCII is \u-escaped first because
 * atob() yields latin1, which would corrupt UTF-8 JSON.
 */
export const windowEnvPayload = (): string => {
  const json = JSON.stringify(flatEnv()).replace(
    /[\u007F-\uFFFF]/g,
    (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
  return Buffer.from(json, 'utf8').toString('base64');
};

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
        // Web build: keep the data placeholder — nginx substitutes it per
        // environment at response time.
        if (isBuild && !isIpfs) return withLoader;
        // Dev serve / IPFS build: fill in the current process env. The
        // IPFS CSP meta gets the loader hash in ipfs-head-defaults-plugin.
        return withLoader.replace(
          WINDOW_ENV_PLACEHOLDER,
          `${WINDOW_ENV_TAG_OPEN}${windowEnvPayload()}</script>`,
        );
      },
    },
    /**
     * `yarn preview` — production-shaped local run of the REAL dist/ (no
     * docker, env from .env.local). `vite preview` alone serves static
     * files, so emulate nginx's response-time substitutions from
     * default.conf.template location /: the window-env placeholder and
     * __PUBLIC_ORIGIN__ (in HTML, plus sitemap.xml/robots.txt). CSP
     * headers are NOT emulated — the dockerized stack remains the
     * authority on those.
     */
    configurePreviewServer(server) {
      if (isIpfs) return; // IPFS dist has env inlined at build time
      const dist = resolve(root, 'dist');
      let probe: string;
      try {
        probe = readFileSync(resolve(dist, 'index.html'), 'utf-8');
      } catch {
        throw new Error(
          'window-env: dist/index.html missing — run `yarn build:web` first',
        );
      }
      if (!probe.includes(WINDOW_ENV_PLACEHOLDER)) {
        throw new Error(
          'window-env: dist/index.html carries no env placeholder (IPFS or stale build in dist/) — rebuild with `yarn build:web`',
        );
      }
      const envDataTag = `${WINDOW_ENV_TAG_OPEN}${windowEnvPayload()}</script>`;
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next();
        // originalUrl, not url: vite's html-fallback middleware runs before
        // hook middlewares here and rewrites unknown GET paths to
        // /index.html in req.url — only originalUrl still says what the
        // client asked for.
        const rawUrl = req.originalUrl ?? req.url ?? '/';
        let pathname: string;
        try {
          pathname = decodeURIComponent(rawUrl.split('?')[0]);
        } catch {
          return next();
        }
        if (pathname.startsWith('/api/')) {
          // undo the fallback rewrite so the proxy sees the real path
          req.url = rawUrl;
          return next();
        }
        const base = resolve(dist, `.${pathname}`);
        if (base !== dist && !base.startsWith(`${dist}/`)) return next();
        const selfOrigin =
          process.env.SELF_ORIGIN ||
          `http://${req.headers.host ?? 'localhost'}`;
        // sitemap.xml / robots.txt: __PUBLIC_ORIGIN__ only (sub_filter_types)
        if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
          if (!existsSync(base)) return next();
          res.setHeader(
            'content-type',
            pathname.endsWith('.xml') ? 'text/xml' : 'text/plain',
          );
          res.end(
            readFileSync(base, 'utf-8').replaceAll(
              '__PUBLIC_ORIGIN__',
              selfOrigin,
            ),
          );
          return;
        }
        // nginx: try_files $uri $uri.html $uri/index.html /index.html —
        // the SPA fallback applies to navigations only; asset-looking
        // paths (dot in the last segment) fall through to the static
        // middleware, which 404s missing files.
        const candidates = pathname.endsWith('/')
          ? [resolve(base, 'index.html')]
          : [base, `${base}.html`, resolve(base, 'index.html')];
        let file = candidates.find(
          (c) => c.endsWith('.html') && existsSync(c) && statSync(c).isFile(),
        );
        if (!file) {
          if (/\.[^/]+$/.test(pathname)) {
            // asset-shaped path: serve if it exists (static middleware),
            // else 404 like nginx `try_files $uri =404` — vite's own SPA
            // fallback would otherwise mask it with the home shell.
            if (existsSync(base) && statSync(base).isFile()) {
              req.url = rawUrl; // undo any fallback rewrite
              return next();
            }
            res.statusCode = 404;
            res.end('not found');
            return;
          }
          file = resolve(dist, 'index.html');
        }
        res.setHeader('content-type', 'text/html');
        res.setHeader('cache-control', 'no-store');
        res.end(
          readFileSync(file, 'utf-8')
            .replace(WINDOW_ENV_PLACEHOLDER, envDataTag)
            .replaceAll('__PUBLIC_ORIGIN__', selfOrigin),
        );
      });
    },
    // Web build: an HTML file without exactly one data placeholder + one
    // loader would be served broken — no env, and config/dynamics.ts fails
    // closed on that. Fail the build instead, then emit the loader's CSP
    // hash for the nginx entrypoint (importmap-csp-hash.txt's sibling).
    async closeBundle() {
      if (!isBuild || isIpfs) return;
      const files = await walkIndexHtml(resolve(root, 'dist'));
      if (files.length === 0) {
        throw new Error('window-env: no index.html emitted into dist/');
      }
      for (const file of files) {
        const html = await readFile(file, 'utf-8');
        for (const [what, needle] of [
          ['data placeholder', WINDOW_ENV_PLACEHOLDER],
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
