import type { FC } from 'react';
import Head from 'next/head';

import { SwapDex } from 'features/swap';
import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const SwapPage: FC = () => {
  return (
    <Layout
      title="Swap"
      subtitle="Swap tokens across supported networks with the best available route."
    >
      <Head>
        <title>Swap | Lido</title>
      </Head>
      <SwapDex />
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps('/swap');

export default SwapPage;
