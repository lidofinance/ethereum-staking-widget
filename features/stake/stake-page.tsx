import Head from 'next/head';

import { Layout } from 'shared/components';
import { Stake } from './stake';

import type { FC, PropsWithChildren } from 'react';
import { SupportL1andL2StakingChains, useDappStatus } from 'modules/web3';

/**
 * Sub-component as useDappStatus accesses context from SupportL1andL2StakingChains
 */
const StakePageLayout: FC<PropsWithChildren> = ({ children }) => {
  const { isChainIdOnL2 } = useDappStatus();

  const subtitle = isChainIdOnL2
    ? 'Stake ETH and receive wstETH while staking'
    : 'Stake ETH and receive stETH while staking';

  return (
    <Layout title="Stake Ether" subtitle={subtitle}>
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      {children}
    </Layout>
  );
};

export const StakePage: FC = () => {
  return (
    <SupportL1andL2StakingChains>
      <StakePageLayout>
        <Stake />
      </StakePageLayout>
    </SupportL1andL2StakingChains>
  );
};
