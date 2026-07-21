import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';

import 'nprogress/nprogress.css';

import { router } from './router';

/**
 * SPA entry. Replaces the Next.js custom server (`server.mjs`) +
 * `pages/_app.tsx` bootstrap.
 *
 * Mounts via `createRoot`, NOT `hydrateRoot`: the served HTML body is the
 * empty `<div id="root">` (the head-only prerender never emits body markup),
 * so there is nothing to hydrate and no mismatch class of bugs.
 *
 * No `<StrictMode>` on purpose — the legacy app never ran under it
 * (`reactStrictMode` was off in next.config.mjs) and the double-invoked
 * effects would surface latent bugs unrelated to this migration.
 *
 * Order matters: `HelmetProvider` sits above the router; everything else
 * (app providers, web3 context, theme, error boundary) lives INSIDE the
 * router so route components can use router hooks — see `router-layout.tsx`.
 */
const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>,
);
