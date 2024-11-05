import Head from 'next/head';

import { Layout } from 'shared/components';
import { Stake } from './stake';

import type { FC } from 'react';

export const StakePage: FC = () => {
  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking"
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <Stake />
    </Layout>
  );
};
