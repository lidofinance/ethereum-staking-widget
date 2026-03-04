import type { FC } from 'react';

import Head from 'next/head';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { EarnVaultsList } from 'features/earn';

const PAGE_TITLE = 'Lido Earn';
const PAGE_DESCRIPTION =
  "Deploy ETH and USD stablecoins into DeFi vaults for on-chain yield through the world's leading protocols.";

const Earn: FC = () => {
  return (
    <Layout title={PAGE_TITLE}>
      <Head>
        <title>{`${PAGE_TITLE} | Lido`}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Head>
      <EarnVaultsList />
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps('/earn');

export default Earn;
