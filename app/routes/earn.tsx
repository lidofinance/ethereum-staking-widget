import Head from 'next/head';

import { Layout } from 'shared/components';
import { EarnVaultsList } from 'features/earn';

const PAGE_TITLE = 'Lido Earn';
const PAGE_DESCRIPTION =
  "Deploy ETH and USD stablecoins into DeFi vaults for on-chain yield through the world's leading protocols.";

/** `/earn` — ported from `pages/earn/index.tsx`. */
export default function EarnPage() {
  return (
    <Layout stylesV2 title={PAGE_TITLE}>
      <Head>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Head>
      <EarnVaultsList />
    </Layout>
  );
}
