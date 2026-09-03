import { Helmet } from 'react-helmet-async';
import type { ReactNode } from 'react';

import { warnShimUsage } from './shim-guard';

/**
 * Compatibility shim for `next/head`. Resolved via Vite alias.
 *
 * `<Head><title>...</title><meta .../></Head>` is forwarded into
 * `react-helmet-async`'s `<Helmet>` so head fragments declared inside
 * components keep working with zero code changes.
 *
 * The `<HelmetProvider>` is mounted in `app/main.tsx`.
 */
export default function HeadShim({ children }: { children?: ReactNode }) {
  warnShimUsage('next/head');
  return <Helmet>{children}</Helmet>;
}
