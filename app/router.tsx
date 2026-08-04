import { createBrowserRouter, createHashRouter, redirect } from 'react-router';

import RouterLayout from './router-layout';
import HomePage from './routes/home';
import WrapPage from './routes/wrap';
import WithdrawalsPage from './routes/withdrawals';
import RewardsPage from './routes/rewards';
import EarnPage from './routes/earn';
import EarnVaultRedirect from './routes/earn-vault-redirect';
import EarnVaultActionPage from './routes/earn-vault-action';
import SettingsPage from './routes/settings';
import NotFoundPage from './routes/not-found';

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

export const router = createRouter([
  {
    Component: RouterLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'wrap', Component: WrapPage },
      { path: 'wrap/:mode', Component: WrapPage },
      {
        path: 'withdrawals',
        loader: () => redirect('/withdrawals/request'),
      },
      { path: 'withdrawals/:mode', Component: WithdrawalsPage },
      { path: 'rewards', Component: RewardsPage },
      { path: 'earn', Component: EarnPage },
      { path: 'earn/:vault', Component: EarnVaultRedirect },
      { path: 'earn/:vault/:action', Component: EarnVaultActionPage },
      { path: 'settings', Component: SettingsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
