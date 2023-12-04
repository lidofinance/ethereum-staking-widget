import { FC, Fragment } from 'react';
import Head from 'next/head';

import { PageFAQ } from '@lidofinance/ui-faq';

import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';

import { Wallet } from './wallet/wallet';
import { StakeForm } from './stake-form/stake-form';
import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';

export type HomePageRegularProps = {
  pageFAQ?: PageFAQ | null;
  // IPFS actual only!
  eTag?: string | null;
};

const HomePageRegular: FC<HomePageRegularProps> = ({ pageFAQ, eTag }) => {
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
          <Fragment key={key}>
            <GoerliSunsetBanner />
            <Wallet />
            <StakeForm />
          </Fragment>
        </NoSSRWrapper>
        <LidoStats />
        <StakeFaq pageFAQ={pageFAQ ?? undefined} eTag={eTag ?? undefined} />
      </Layout>
    </>
  );
};

export default HomePageRegular;
