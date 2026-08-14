import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import sri from 'vite-plugin-sri-gen';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

import { metaTagsToHtml, pageMeta, ROUTE_META, sitemapXml } from './shared/seo';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const isIpfs = process.env.IPFS_MODE === 'true';

const shim = (rel: string) => resolve(root, 'shims', rel);

/**
 * Pure SPA build — no SSR, no framework runtime (RFC "Option B: Vite +
 * React SPA + Fastify"). React Router 7 framework mode is deliberately NOT
 * used: it drags all client code through Vite's SSR transformer
 * (CJS-interop breakage with styled-components@5 and friends) and hydrates
 * a prerendered body, which this non-deterministic SPA (theme-from-cookie,
 * breakpoints, wallet state) cannot survive without app-wide mismatches —
 * empirically verified in the PoC repo, see
 * simple-staking-widget/docs/migration/framework-mode-experiment.md.
 *
 * Routing is client-side via `createBrowserRouter` (`app/router.tsx`;
 * hash-router in IPFS mode). SEO is closed with head-only prerender at
 * build time (phase 6 of docs/migration/PLAN.md).
 */

/**
 * IPFS serves a single `index.html` (no path-based routing), so the
 * per-route prerender plugin is off there. Inject the default
 * og/twitter/description block statically (no canonical — the gateway URL
 * isn't canonical), the CSP `<meta http-equiv>` (was `_document.tsx` +
 * next-secure-headers; directives that only work as HTTP headers —
 * frame-ancestors, report-uri — are omitted per spec), and relativize
 * absolute asset hrefs so the build works from any gateway path prefix.
 */
const ipfsHeadDefaults = (): Plugin => {
  // IPFS SPA base-path reference:
  // https://github.com/Velenir/nextjs-ipfs-example
  //
  // IPFS gateways serve the build from arbitrary path prefixes
  // (/ipfs/<CID>/...), so relative asset URLs need a <base> pointing at the
  // current directory. The script must run before the bundle evaluates.
  const IPFS_BASE_SCRIPT_CONTENT = `
(function () {
  const base = document.createElement('base');
  base.href = window.location.pathname;
  document.head.append(base);
})();
`;

  const IPFS_BASE_SCRIPT_HASH =
    'sha256-' +
    createHash('sha256').update(IPFS_BASE_SCRIPT_CONTENT).digest('base64');

  // Mirrors the non-report parts of the legacy config/csp for IPFS mode.
  const csp = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.reown.com",
    "img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com",
    // The only inline script in the IPFS build is the <base> bootstrap
    // above. (The legacy lido-ui cookie-theme hash 'sha256-wTvVT3oJ…' is
    // gone: the SPA initializes theme via initGlobalCookieTheme inside the
    // bundle, ScriptThemeValue is rendered nowhere.)
    `script-src 'self' ${IPFS_BASE_SCRIPT_HASH}`,
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com",
    "child-src 'self' https://*.walletconnect.org https://*.walletconnect.com",
    "worker-src 'none'",
    "object-src 'none'",
    "media-src 'self'",
    "manifest-src 'self'",
    "form-action 'self'",
    "script-src-attr 'none'",
  ].join('; ');

  return {
    name: 'ipfs-head-defaults',
    transformIndexHtml(html) {
      return html.replace(/(href|src)="\//g, '$1="./').replace(
        '</head>',
        `<script>${IPFS_BASE_SCRIPT_CONTENT}</script>
<meta http-equiv="Content-Security-Policy" content="${csp}" />
${metaTagsToHtml(pageMeta(undefined))}\n  </head>`,
      );
    },
  };
};

/**
 * Emit `sitemap.xml` at build time, listing every prerendered route.
 * URLs use the `__PUBLIC_ORIGIN__` placeholder — nginx `sub_filter`
 * rewrites them to the per-env absolute origin at response time.
 */
const emitSitemap = (): Plugin => {
  return {
    name: 'emit-sitemap',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(),
      });
    },
  };
};

/**
 * After the prerender plugin writes `dist/<route>/index.html`, splice in
 * any `jsonLd` from `ROUTE_META[<route>]` as a
 * `<script type="application/ld+json">` before `</head>`. The
 * vite-prerender-plugin `head.elements` API only supports void elements
 * (no children), so JSON-LD is post-processed here. `<` is escaped to
 * `<` so data can never break out of the script element.
 */
const walkIndexHtml = async (dir: string): Promise<string[]> => {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...(await walkIndexHtml(path)));
    } else if (entry.name === 'index.html') {
      out.push(path);
    }
  }
  return out;
};

const injectJsonLd = (): Plugin => {
  const distDir = resolve(root, 'dist');
  return {
    name: 'inject-json-ld',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const files = await walkIndexHtml(distDir);
      for (const file of files) {
        const routePath =
          file.slice(distDir.length).replace(/\/index\.html$/, '') || '/';
        const jsonLd = ROUTE_META[routePath]?.jsonLd;
        if (!jsonLd) continue;
        const html = await readFile(file, 'utf-8');
        const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
        const script = `<script type="application/ld+json">${json}</script>`;
        await writeFile(file, html.replace('</head>', `${script}</head>`));
      }
    },
  };
};

// NB: the prerender entry chunk (assets/prerender-*.js) is NOT build-time
// dead weight and must not be pruned from the bundle: rolldown assigns
// modules shared between scripts/prerender.ts and the app (shared/seo and
// friends) to it, so app chunks statically import it at runtime
// (empirically: the index entry side-effect-imports it, withdrawals pulls
// named exports). It ships SRI-covered like any other chunk.

/**
 * Emit `importmap-csp-hash.txt` into the build output: the sha256 CSP
 * source of the inline import map that vite-plugin-sri-gen injects into
 * every HTML file. The nginx entrypoint splices it into the runtime CSP's
 * script-src — an enforcing CSP without it blocks the import map, and
 * module-graph SRI silently disappears (documented fail-open of the
 * plugin). A single header-level hash only works if the map is
 * byte-identical across all prerendered HTML files, so divergence fails
 * the build rather than silently un-verifying some routes.
 */
const emitImportMapCspHash = (): Plugin => {
  const distDir = resolve(root, 'dist');
  return {
    name: 'emit-import-map-csp-hash',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const files = await walkIndexHtml(distDir);
      const hashes = new Set<string>();
      for (const file of files) {
        const match = (await readFile(file, 'utf-8')).match(
          /<script type="importmap">(.*?)<\/script>/s,
        );
        if (!match) {
          throw new Error(`emit-import-map-csp-hash: no import map in ${file}`);
        }
        hashes.add(createHash('sha256').update(match[1]).digest('base64'));
      }
      if (hashes.size !== 1) {
        throw new Error(
          `emit-import-map-csp-hash: import maps diverge across HTML files (${hashes.size} variants) — a single CSP hash cannot cover them`,
        );
      }
      await writeFile(
        resolve(distDir, 'importmap-csp-hash.txt'),
        `sha256-${[...hashes][0]}\n`,
      );
    },
  };
};

/**
 * `.md` files were loaded through webpack's `raw-loader`; mirror that by
 * serving them as raw strings without touching the import sites
 * (Vite's native alternative would be a `?raw` suffix on every import).
 */
const rawMarkdown = (): Plugin => {
  return {
    name: 'raw-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
};

export default defineConfig({
  // BASE_PATH kept for parity with next.config.mjs `basePath`; IPFS builds
  // are served from arbitrary gateway paths, hence relative base.
  base: isIpfs ? './' : process.env.BASE_PATH || '/',
  plugins: [
    // NOTE: @vitejs/plugin-react 6 is oxc-based (rolldown-vite) — the babel
    // option is gone, so the legacy babel-plugin-styled-components transform
    // (displayName/stable class names) is not applied. styled-components
    // works via its runtime; only devtools naming differs.
    react(),
    rawMarkdown(),
    // SEO. Web build: HEAD-ONLY prerender — per-route <head> emitted into
    // static per-route index.html files, body stays the SPA bootstrap
    // (never hydrated) + sitemap.xml + JSON-LD. IPFS build: single
    // index.html with static head defaults + CSP meta.
    ...(isIpfs
      ? [ipfsHeadDefaults()]
      : [
          vitePrerenderPlugin({
            renderTarget: '#root',
            prerenderScript: resolve(root, 'scripts/prerender.ts'),
          }),
          emitSitemap(),
          injectJsonLd(),
          emitImportMapCspHash(),
        ]),
    // SVGs:
    //   `import url from 'foo.svg'`             → URL string (Vite default)
    //   `import Component from 'foo.svg?react'` → React component (svgr)
    // The `import { ReactComponent }` sites (@svgr/webpack convention) are
    // migrated to the `?react` suffix form.
    svgr(),
    // runtimePatchDynamicLinks (default true) prepends an SRI runtime + a map
    // of ALL other assets' hashes into every entry chunk AFTER Rollup has
    // fixed the content-hashed filenames. Entry filenames then no longer
    // track entry bytes across builds — same URL, new bytes. With immutable
    // asset caching (nginx max-age=31536000 + Cloudflare) a cached copy from
    // a previous deploy then fails the fresh HTML's integrity check and the
    // browser blocks it. Disabled: integrity is still delivered via static
    // tags, the inline import map and modulepreload links — all in HTML,
    // which is short-cached — and chunk bytes stay true to their hashed
    // names.
    sri({
      runtimePatchDynamicLinks: false,
      // IPFS: the relative base ('./') cannot produce valid import-map
      // keys, so the plugin skips the import map there and module-graph
      // chunks reached only via static imports inside lazy chunks would
      // load with NO integrity (the plugin warns: 48 chunks at the time of
      // writing). false moves all hashes to static modulepreload links —
      // full-graph coverage in every SRI-capable browser, at the cost of
      // eager-fetching the graph. Web keeps the import map (lazy loading
      // preserved); its CSP hash is emitted by emitImportMapCspHash.
      ...(isIpfs ? { importMapIntegrity: false } : {}),
    }),
  ],
  resolve: {
    alias: [
      // Project dirs used as absolute import roots (tsconfig `paths` has the
      // same list for the type-checker). Explicit aliases instead of
      // vite-tsconfig-paths: the tsconfig also carries TYPE-ONLY mappings
      // (@lidofinance/* d.ts workarounds) that must never reach runtime
      // resolution.
      ...[
        'abi',
        'assets',
        'config',
        'consts',
        'features',
        'modules',
        'networks',
        'providers',
        'shared',
        'styles',
        'types',
        'utils',
      ].map((dir) => ({ find: dir, replacement: resolve(root, dir) })),
      // Drop-in shims for the Next.js modules used across the codebase.
      // `(\.js)?` also catches dependency-side specifiers like
      // `next/link.js` (e.g. @lidofinance/lido-ui's DynamicLink).
      { find: /^next\/router(\.js)?$/, replacement: shim('next-router.tsx') },
      { find: /^next\/link(\.js)?$/, replacement: shim('next-link.tsx') },
      { find: /^next\/head(\.js)?$/, replacement: shim('next-head.tsx') },
      { find: /^next\/config(\.js)?$/, replacement: shim('next-config.tsx') },
      { find: /^next\/dynamic(\.js)?$/, replacement: shim('next-dynamic.tsx') },
      { find: /^next$/, replacement: shim('next-types.ts') },
      // Optional wallet connectors the legacy webpack config stubbed via
      // `resolve.fallback: false` — keep them out of the bundle.
      {
        find: /^@base-org\/account$/,
        replacement: shim('empty-module.ts'),
      },
      { find: /^porto$/, replacement: shim('empty-module.ts') },
      { find: /^@gemini-wallet\/core$/, replacement: shim('empty-module.ts') },
      {
        find: /^@react-native-async-storage\/async-storage$/,
        replacement: shim('empty-module.ts'),
      },
      // Exact 'zod' imports go through a wrapper that disables Zod's
      // eval-based JIT (CSP forbids eval). 'zod/mini' etc. stay untouched.
      { find: /^zod$/, replacement: resolve(root, 'utils/zod-setup.ts') },
      // Root-level modules imported with bare specifiers.
      {
        find: /^env-dynamics\.mjs$/,
        replacement: resolve(root, 'env-dynamics.mjs'),
      },
      { find: /^IPFS\.json$/, replacement: resolve(root, 'IPFS.json') },
      {
        find: /^REMOTE_CONFIG_MANIFEST\.json$/,
        replacement: resolve(root, 'REMOTE_CONFIG_MANIFEST.json'),
      },
      {
        find: /^build-info\.json$/,
        replacement: resolve(root, 'build-info.json'),
      },
    ],
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    proxy: isIpfs
      ? undefined
      : {
          '/api': {
            target: process.env.API_DEV_URL || 'http://localhost:3001',
            changeOrigin: true,
          },
        },
  },
  envPrefix: ['VITE_'],
  define: {
    // Replaces webpack-preprocessor-loader's `#!if IPFS_MODE` directives.
    __IPFS_MODE__: JSON.stringify(isIpfs),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['styled-components', 'react-helmet-async'],
  },
});
