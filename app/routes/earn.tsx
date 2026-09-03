import { Helmet } from 'react-helmet-async';

import { Layout } from 'shared/components';
import { EarnVaultsList } from 'features/earn';

const PAGE_TITLE = 'Lido Earn';
const PAGE_DESCRIPTION =
  "Deploy ETH and USD stablecoins into DeFi vaults for on-chain yield through the world's leading protocols.";

/** `/earn` — ported from `pages/earn/index.tsx`. */
export default function EarnPage() {
  return (
    <Layout stylesV2 title={PAGE_TITLE}>
      <Helmet>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Helmet>
      <EarnVaultsList />
    </Layout>
  );
}
