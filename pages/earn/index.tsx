import type { FC } from 'react';

import Head from 'next/head';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { EarnVaultsList } from 'features/earn';

const PAGE_TITLE = 'Earn';
const PAGE_DESCRIPTION =
  'Deposit ETH/WETH/stETH/wstETH into vaults to earn higher rewards';

const Earn: FC = () => {
  return (
    <Layout title={PAGE_TITLE} subtitle={PAGE_DESCRIPTION}>
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
