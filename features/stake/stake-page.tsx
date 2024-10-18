import Head from 'next/head';

import { SupportOnlyL1Chains } from 'modules/web3';
import { Layout } from 'shared/components';
import { Stake } from './stake';

import type { FC } from 'react';
export const StakePage: FC = () => {
  return (
    <SupportOnlyL1Chains>
      <Layout
        title="Stake Ether"
        subtitle="Stake ETH and receive stETH while staking"
      >
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>
        <Stake />
      </Layout>
    </SupportOnlyL1Chains>
  );
};
