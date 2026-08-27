import type { ComponentType } from 'react';
import { createBrowserRouter, createHashRouter, redirect } from 'react-router';

import RouterLayout from './router-layout';
import HomePage from './routes/home';
import { hasTrailingSlash, stripTrailingSlashLoader } from './trailing-slash';

/**
 * Route table — mirrors the Next.js Pages Router surface as of the
 * migration (see docs/migration/PLAN.md):
 *
 *   /                       → HomePage           (stake, or IPFS home)
 *   /wrap                   → WrapPage           (mode = wrap)
 *   /wrap/:mode             → WrapPage           (only `unwrap`, else 404)
 *   /withdrawals            → redirect → /withdrawals/request
 *   /withdrawals/:mode      → WithdrawalsPage    (request | claim, else 404)
 *   /rewards                → RewardsPage
 *   /earn                   → EarnPage
 *   /earn/:vault            → EarnVaultRedirect  (→ /earn/:vault/deposit)
 *   /earn/:vault/:action    → EarnVaultActionPage
 *   /settings               → SettingsPage       (IPFS build only)
 *   *                       → NotFoundPage (404)
 *
 * The `/withdrawals` redirect lived in next.config.mjs `redirects()`; it is
 * a route loader now. Param whitelists that lived in `getStaticPaths` are
 * runtime checks inside the route components (rendering the 404 page on
 * mismatch — a SPA cannot emit an HTTP 404 anyway).
 */

// IPFS deploys are static files on a path-prefixed gateway — path-based
// routing breaks on hard refresh (no server rewrite to index.html).
// HashRouter encodes the route in the URL fragment instead. This replaces
// the legacy hand-rolled `#`-prefix machinery (`utils/get-ipfs-base-path`).
const createRouter = __IPFS_MODE__ ? createHashRouter : createBrowserRouter;

// Route-level code splitting (Next's Pages Router gave this for free): only
// HomePage is in the entry chunk — it's the default landing route. While a
// lazy chunk loads, useNavigation() reports 'loading' and the nProgress bar
// runs (see NavigationProgress in router-layout.tsx).
const lazyRoute =
  (load: () => Promise<{ default: ComponentType }>) => async () => ({
    Component: (await load()).default,
  });

export const router = createRouter([
  {
    Component: RouterLayout,
    // `/wrap/` → `/wrap` (see app/trailing-slash.ts). A layout loader does
    // not re-run on child navigations by itself, so ADD a trigger for URLs
    // that need normalizing — on top of (never instead of) the default
    // revalidation logic, which must stay intact for actions/param changes.
    loader: stripTrailingSlashLoader,
    shouldRevalidate: ({ nextUrl, defaultShouldRevalidate }) =>
      defaultShouldRevalidate || hasTrailingSlash(nextUrl.pathname),
    // a route with a loader renders this during the initial load; the served
    // body is empty until the app mounts anyway (head-only prerender), so
    // null changes nothing visible — it only silences the RR7 warning about
    // a missing HydrateFallback
    HydrateFallback: () => null,
    children: [
      { index: true, Component: HomePage },
      { path: 'wrap', lazy: lazyRoute(() => import('./routes/wrap')) },
      { path: 'wrap/:mode', lazy: lazyRoute(() => import('./routes/wrap')) },
      {
        path: 'withdrawals',
        loader: () => redirect('/withdrawals/request'),
      },
      {
        path: 'withdrawals/:mode',
        lazy: lazyRoute(() => import('./routes/withdrawals')),
      },
      { path: 'rewards', lazy: lazyRoute(() => import('./routes/rewards')) },
      { path: 'earn', lazy: lazyRoute(() => import('./routes/earn')) },
      {
        path: 'earn/:vault',
        lazy: lazyRoute(() => import('./routes/earn-vault-redirect')),
      },
      {
        path: 'earn/:vault/:action',
        lazy: lazyRoute(() => import('./routes/earn-vault-action')),
      },
      { path: 'settings', lazy: lazyRoute(() => import('./routes/settings')) },
      { path: '*', lazy: lazyRoute(() => import('./routes/not-found')) },
    ],
  },
]);
