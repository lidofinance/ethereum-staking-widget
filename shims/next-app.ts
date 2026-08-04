/**
 * Shim for `next/app`. Only the `AppProps` type was ever imported from here
 * (legacy `config/csp/index.ts` / `pages/_app.tsx`, both deleted by the
 * migration). Kept so stray type imports compile until the last consumer
 * is gone; delete once nothing resolves `next/app`.
 */

import type { ComponentType } from 'react';

export interface AppProps<P = Record<string, unknown>> {
  Component: ComponentType<P>;
  pageProps: P;
}

export type AppContext = unknown;

export type AppInitialProps = { pageProps: Record<string, unknown> };

const AppDefault = function App() {
  return null;
};

export default AppDefault;
