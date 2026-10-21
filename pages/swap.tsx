import type { FC } from 'react';
import Head from 'next/head';

import { SwapDex, SupportL1AndSwapL2Chains } from 'features/swap';
import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const SwapPage: FC = () => {
  return (
    <SupportL1AndSwapL2Chains>
      <Layout
        title="Swap"
        subtitle="Swap tokens across supported networks with the best available route."
      >
        <Head>
          <title>Swap | Lido</title>
        </Head>
        <SwapDex />
      </Layout>
    </SupportL1AndSwapL2Chains>
  );
};

export const getStaticProps = getDefaultStaticProps('/swap');

export default SwapPage;
