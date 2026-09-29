import Head from 'next/head';

import { Layout } from 'shared/components';
import { Stake } from './stake';

import type { FC } from 'react';
import { SupportL1andL2StakingChains } from 'modules/web3';

export const StakePage: FC = () => {
  return (
    <SupportL1andL2StakingChains>
      <Layout
        title="Stake Ether"
        subtitle="Stake ETH and receive stETH while staking"
      >
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>
        <Stake />
      </Layout>
    </SupportL1andL2StakingChains>
  );
};
