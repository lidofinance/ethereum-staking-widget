import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { Helmet } from 'react-helmet-async';
import nProgress from 'nprogress';

import { Fonts, LidoUIHead, ToastContainer } from '@lidofinance/lido-ui';

import { config } from 'config';
import { SecurityStatusBanner } from 'features/ipfs';
import { QaDebugGate } from 'features/qa-debug';
import { Providers } from 'providers';
import { BackgroundGradient } from 'shared/components/background-gradient';
import { ErrorBoundaryFallback } from 'shared/components/error-boundary';

nProgress.configure({ showSpinner: false });

/**
 * Route-change progress bar. Replaces `utils/nprogress.ts`, which listened
 * on `Router.events` (a Next-only API): React Router exposes the pending
 * navigation state via `useNavigation` instead.
 */
const NavigationProgress = (): null => {
  const { state } = useNavigation();
  useEffect(() => {
    if (state === 'idle') nProgress.done();
    else nProgress.start();
  }, [state]);
  return null;
};

/**
 * Root layout — everything `pages/_app.tsx` used to mount, INSIDE the
 * router so providers that call router hooks (`AppFlagProvider`,
 * `InpageNavigationProvider`, …) have a valid router context.
 *
 * `<Fonts />` and `<LidoUIHead />` used to render in `_document.tsx`'s
 * server-side head; they emit plain `<style>`/`<script>` elements that work
 * from anywhere in the document, so they mount here now. The `currentChain`
 * meta (consumed by QA tooling) is runtime config, hence Helmet and not
 * index.html.
 *
 * The error boundary wraps only the routed page — layout chrome
 * (toast container, security banner) stays alive on page errors, matching
 * the legacy `_app.tsx` structure.
 */
export default function RouterLayout() {
  return (
    <Providers>
      <Helmet>
        <meta name="currentChain" content={String(config.defaultChain)} />
      </Helmet>
      <Fonts />
      <LidoUIHead />
      <BackgroundGradient
        width={1560}
        height={784}
        style={{
          opacity: 'var(--lido-color-darkThemeOpacity)',
        }}
      />
      <ToastContainer />
      <ErrorBoundary fallbackRender={ErrorBoundaryFallback}>
        <Outlet />
      </ErrorBoundary>
      <SecurityStatusBanner />
      <QaDebugGate />
      <NavigationProgress />
      {/* Next scrolled to top on navigation by default; RR7 needs this */}
      <ScrollRestoration />
    </Providers>
  );
}
