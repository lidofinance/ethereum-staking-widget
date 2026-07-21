import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

import { metaTagsToHtml, pageMeta, ROUTE_META, sitemapXml } from './shared/seo';
import { IPFS_BASE_SCRIPT_HASH } from './features/ipfs/ipfs-base-script';

const root = dirname(fileURLToPath(import.meta.url));
const isIpfs = process.env.VITE_IPFS_MODE === 'true';
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
  // Mirrors the non-report parts of the legacy config/csp for IPFS mode.
  const csp = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.reown.com",
    "img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com",
    `script-src 'self' 'sha256-wTvVT3oJ2rMAqNUILvSYccTn53N47S3NIZbPE0ql0No=' ${IPFS_BASE_SCRIPT_HASH}`,
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
      return html
        .replace(/(href|src)="\//g, '$1="./')
        .replace(
          '</head>',
          `    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n` +
            `    ${metaTagsToHtml(pageMeta(undefined))}\n  </head>`,
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
const injectJsonLd = (): Plugin => {
  const distDir = resolve(root, 'dist');
  const walk = async (dir: string): Promise<string[]> => {
    const out: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        out.push(...(await walk(path)));
      } else if (entry.name === 'index.html') {
        out.push(path);
      }
    }
    return out;
  };
  return {
    name: 'inject-json-ld',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const files = await walk(distDir);
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
        ]),
    // SVGs:
    //   `import url from 'foo.svg'`             → URL string (Vite default)
    //   `import Component from 'foo.svg?react'` → React component (svgr)
    // The `import { ReactComponent }` sites (@svgr/webpack convention) are
    // migrated to the `?react` suffix form.
    svgr(),
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
      { find: /^next\/app(\.js)?$/, replacement: shim('next-app.ts') },
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
