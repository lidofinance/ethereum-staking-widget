import { FC } from 'react';
import Head from 'next/head';
import { PageFAQ } from '@lidofinance/ui-faq';

import { Layout } from 'shared/components';

import { StakeFaq } from './stake-faq/stake-faq';
import { Stake } from './stake';

export type StakePageProps = {
  pageFAQ?: PageFAQ | null;
  // IPFS actual only!
  faqETag?: string | null;
};

export const StakePage: FC<StakePageProps> = ({ pageFAQ, faqETag }) => {
  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <Stake />
      <StakeFaq pageFAQ={pageFAQ ?? undefined} eTag={faqETag ?? undefined} />
    </Layout>
  );
};
