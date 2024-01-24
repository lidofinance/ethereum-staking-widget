import { FC } from 'react';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { FaqWithMeta } from 'utils/faq';

import { StakeFaq } from './stake-faq/stake-faq';
import { Stake } from './stake';

export type StakePageProps = {
  faqWithMeta: FaqWithMeta | null;
};

export const StakePage: FC<StakePageProps> = ({ faqWithMeta }) => {
  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <Stake />
      {faqWithMeta && <StakeFaq faqWithMeta={faqWithMeta} />}
    </Layout>
  );
};
