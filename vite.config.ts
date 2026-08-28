import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import sriPlugin from 'vite-plugin-sri-gen';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';

import { emitImportMapCspHashPlugin } from './scripts/vite/emit-import-map-csp-hash-plugin';
import { emitSitemapPlugin } from './scripts/vite/emit-sitemap-plugin';
import { injectJsonLdPlugin } from './scripts/vite/inject-json-ld-plugin';
import { ipfsHeadDefaultsPlugin } from './scripts/vite/ipfs-head-defaults-plugin';
import { rawMarkdownPlugin } from './scripts/vite/raw-markdown-plugin';
import { shimUsageReporterPlugin } from './scripts/vite/shim-usage-reporter-plugin';
import { windowEnvPlugin } from './scripts/vite/window-env-plugin';

const root = dirname(fileURLToPath(import.meta.url));
const isIpfs = process.env.IPFS_MODE === 'true';

// Shared by dev serve and preview: same /api → fastify contract as the
// nginx proxy_pass in production.
const API_PROXY = {
  '/api': {
    target: process.env.API_DEV_URL || 'http://localhost:3001',
    changeOrigin: true,
  },
};

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
 *
 * Custom plugins live in `scripts/vite/`, one file per plugin.
 */

// NB: the prerender entry chunk (assets/prerender-*.js) is NOT build-time
// dead weight and must not be pruned from the bundle: rolldown assigns
// modules shared between scripts/prerender.ts and the app (shared/seo and
// friends) to it, so app chunks statically import it at runtime
// (empirically: the index entry side-effect-imports it, withdrawals pulls
// named exports). It ships SRI-covered like any other chunk.

export default defineConfig({
  // BASE_PATH kept for parity with next.config.mjs `basePath`; IPFS builds
  // are served from arbitrary gateway paths, hence relative base.
  base: isIpfs ? './' : process.env.BASE_PATH || '/',
  plugins: [
    // NOTE: @vitejs/plugin-react 6 is oxc-based (rolldown-vite) — the babel
    // option is gone, so the legacy babel-plugin-styled-components transform
    // (displayName/stable class names) is not applied. styled-components
    // works via its runtime; only devtools naming differs.
    reactPlugin(),
    rawMarkdownPlugin(),
    shimUsageReporterPlugin(root),
    // Runtime env: inlines window.__env__ in dev/IPFS; web builds keep the
    // index.html placeholder for the nginx entrypoint (see the plugin for
    // the full contract).
    windowEnvPlugin(root, isIpfs),
    // SEO. Web build: HEAD-ONLY prerender — per-route <head> emitted into
    // static per-route index.html files, body stays the SPA bootstrap
    // (never hydrated) + sitemap.xml + JSON-LD. IPFS build: single
    // index.html with static head defaults + CSP meta.
    ...(isIpfs
      ? [ipfsHeadDefaultsPlugin()]
      : [
          vitePrerenderPlugin({
            renderTarget: '#root',
            prerenderScript: resolve(root, 'scripts/prerender.ts'),
          }),
          emitSitemapPlugin(),
          injectJsonLdPlugin(root),
          emitImportMapCspHashPlugin(root),
        ]),
    // SVGs:
    //   `import url from 'foo.svg'`             → URL string (Vite default)
    //   `import Component from 'foo.svg?react'` → React component (svgr)
    // The `import { ReactComponent }` sites (@svgr/webpack convention) are
    // migrated to the `?react` suffix form.
    svgrPlugin(),
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
    sriPlugin({
      runtimePatchDynamicLinks: false,
      // IPFS: the relative base ('./') cannot produce valid import-map
      // keys, so the plugin skips the import map there and module-graph
      // chunks reached only via static imports inside lazy chunks would
      // load with NO integrity (the plugin warns: 48 chunks at the time of
      // writing). false moves all hashes to static modulepreload links —
      // full-graph coverage in every SRI-capable browser, at the cost of
      // eager-fetching the graph. Web keeps the import map (lazy loading
      // preserved); its CSP hash is emitted by emitImportMapCspHashPlugin.
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
      // Drop-in shims for Next.js modules. App code no longer imports
      // `next/*` — these remain for dependency-side specifiers, incl.
      // `next/link.js` (e.g. @lidofinance/lido-ui's DynamicLink).
      { find: /^next\/router(\.js)?$/, replacement: shim('next-router.tsx') },
      { find: /^next\/link(\.js)?$/, replacement: shim('next-link.tsx') },
      { find: /^next\/head(\.js)?$/, replacement: shim('next-head.tsx') },
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
    proxy: isIpfs ? undefined : API_PROXY,
  },
  // `yarn preview` — production-shaped run of the real dist/ against the
  // built api, envs from .env.local, no docker. HTML substitution and the
  // build preflight live in windowEnvPlugin's configurePreviewServer.
  preview: {
    port: Number(process.env.PORT) || 3000,
    // no silent port hopping: the fallback port would be 3001 — the api's —
    // and a busy 3000 usually means a forgotten dev server, not a reason
    // to relocate a production-shaped preview.
    strictPort: true,
    proxy: isIpfs ? undefined : API_PROXY,
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
