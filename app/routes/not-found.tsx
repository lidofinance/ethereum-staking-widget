import { Helmet } from 'react-helmet-async';
import { ServicePage } from '@lidofinance/lido-ui';

/**
 * 404 — ported from `pages/404.tsx`. Also rendered inline by routes whose
 * params fail validation (the old `getStaticPaths` whitelists).
 * `pages/500.tsx` has no SPA equivalent — server errors don't render React;
 * page crashes are handled by the error boundary in `router-layout.tsx`.
 */
export default function NotFoundPage() {
  return (
    <ServicePage title="404">
      <Helmet>
        <title>Lido | Page Not Found</title>
      </Helmet>
      Page Not Found
    </ServicePage>
  );
}
