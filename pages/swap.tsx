import type { FC } from 'react';
import Head from 'next/head';

import { SwapDex, SWAP_COWSWAP_PROFILE } from 'features/swap';
import { SupportL1AndCustomL2Chains } from 'modules/web3';
import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const SwapPage: FC = () => {
  return (
    <SupportL1AndCustomL2Chains l2ChainIds={SWAP_COWSWAP_PROFILE.chainIds}>
      <Layout
        title="Swap"
        subtitle="Swap tokens across supported networks with the best available route."
      >
        <Head>
          <title>Swap | Lido</title>
        </Head>
        <SwapDex />
      </Layout>
    </SupportL1AndCustomL2Chains>
  );
};

export const getStaticProps = getDefaultStaticProps('/swap');

export default SwapPage;
