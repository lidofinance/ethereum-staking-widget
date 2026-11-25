import { Helmet } from 'react-helmet-async';

import { SwapDex, SupportL1AndSwapL2Chains } from 'features/swap';
import { Layout } from 'shared/components';

/** `/swap` — ported from `pages/swap.tsx`. */
export default function SwapPage() {
  return (
    <SupportL1AndSwapL2Chains>
      <Layout title="Swap">
        <Helmet>
          <title>Swap | Lido</title>
        </Helmet>
        <SwapDex />
      </Layout>
    </SupportL1AndSwapL2Chains>
  );
}
