import { FC, Fragment } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import { parseFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { FAQ_REVALIDATE_SECS } from 'config';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaq } from 'utilsApi/get-faq';

import { Wallet } from './wallet/wallet';
import { StakeForm } from './stake-form/stake-form';
import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';

type HomeProps = {
  pageFAQ?: PageFAQ | null;
};

const HomePageRegular: FC<HomeProps> = ({ pageFAQ }) => {
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
        <StakeFaq pageFAQ={pageFAQ ?? undefined} />
      </Layout>
    </>
  );
};

export default HomePageRegular;

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
