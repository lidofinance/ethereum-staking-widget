import { FC } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import { parseFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { FAQ_REVALIDATE_SECS } from 'config';
import { Wallet, StakeForm, LidoStats, StakeFaq } from 'features/home';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaq } from '../utilsApi/get-faq';

type HomeProps = {
  pageFAQ: PageFAQ | null;
};

const Home: FC<HomeProps> = ({ pageFAQ }) => {
  const key = useWeb3Key();
  return (
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
      <StakeFaq pageFAQ={pageFAQ ?? undefined} />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  // FAQ
  let pageFAQ: PageFAQ | null = null;

  try {
    const rawFaqData = await getFaq(
      'ethereum-staking-widget/faq-stake-page.md',
    );
    if (rawFaqData) {
      pageFAQ = await parseFAQ(rawFaqData);
    }
  } catch {
    console.warn('FAQ not available on stake page!');
  }

  return {
    props: {
      // We can't use `undefined` with `pageFAQ`.
      // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
      pageFAQ: pageFAQ || null,
    },
    revalidate: FAQ_REVALIDATE_SECS,
  };
};
