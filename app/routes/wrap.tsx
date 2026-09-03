import { useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { SupportL2Chains } from 'modules/web3';
import { LegalDisclaimer } from 'shared/components/legal-disclaimer';
import { DisclaimerSection } from 'shared/components/disclaimer-section';

import NotFoundPage from './not-found';

/**
 * `/wrap` and `/wrap/:mode` — ported from `pages/wrap/[[...mode]].tsx`.
 * The old `getStaticPaths` whitelist emitted only `undefined` (wrap) and
 * `['unwrap']`; anything else renders the 404 page.
 */
export default function WrapPage() {
  const { mode } = useParams<{ mode: string }>();
  if (mode !== undefined && mode !== 'unwrap') return <NotFoundPage />;

  return (
    <SupportL2Chains>
      <Layout
        title="Wrap & Unwrap"
        subtitle="Stable-balance stETH wrapper for DeFi"
      >
        <Helmet>
          <title>Wrap | Lido</title>
        </Helmet>
        <WrapUnwrapTabs mode={mode === 'unwrap' ? 'unwrap' : 'wrap'} />
        <DisclaimerSection>
          <LegalDisclaimer />
        </DisclaimerSection>
      </Layout>
    </SupportL2Chains>
  );
}
