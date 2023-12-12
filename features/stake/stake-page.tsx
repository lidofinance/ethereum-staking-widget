import { Stake } from './stake';
import Head from 'next/head';
import { FC } from 'react';
import { Layout } from 'shared/components';

export { Stake } from './stake';

export const StakePage: FC = () => {
  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <Stake />
    </Layout>
  );
};
