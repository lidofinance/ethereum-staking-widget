import Head from 'next/head';

import { Layout } from 'shared/components';
import { Stake } from './stake';

import type { FC } from 'react';
import { SupportL1andL2StakingChains } from 'modules/web3';
import { useChainId } from 'wagmi';
import { isSupportedL2StakingChain } from 'consts/chains';

export const StakePage: FC = () => {
  const currentChainId = useChainId();
  const isL2Staking = isSupportedL2StakingChain(currentChainId);

  const subtitle = isL2Staking
    ? 'Stake ETH and receive wstETH while staking'
    : 'Stake ETH and receive stETH while staking';

  return (
    <SupportL1andL2StakingChains>
      <Layout title="Stake Ether" subtitle={subtitle}>
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>
        <Stake />
      </Layout>
    </SupportL1andL2StakingChains>
  );
};
