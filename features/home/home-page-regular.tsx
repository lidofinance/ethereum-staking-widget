import { FC } from 'react';
import Head from 'next/head';

import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';

import { Wallet } from './wallet/wallet';
import { StakeForm } from './stake-form/stake-form';
import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';

const HomePageRegular: FC = () => {
  const key = useWeb3Key();

  return (
    <>
      <Layout
        title="Stake Ether"
        subtitle="Stake ETH and receive stETH while staking."
      >
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>

        <NoSSRWrapper>
          <Wallet key={'wallet' + key} />
          <StakeForm key={'form' + key} />
        </NoSSRWrapper>
        <LidoStats />
        <StakeFaq />
      </Layout>
    </>
  );
};

export default HomePageRegular;
