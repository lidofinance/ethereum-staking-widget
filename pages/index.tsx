import { FC } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getFAQ, FAQItem, PageFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig } from 'config';
import { Wallet, StakeForm, LidoStats, StakeFaq } from 'features/home';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

interface HomeProps {
  faqList?: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => (
  <>
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>

      <NoSSRWrapper>
        <Wallet />
        <StakeForm />
      </NoSSRWrapper>
      <LidoStats />
      <StakeFaq faqList={faqList} />
    </Layout>
  </>
);

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const pageIdentification = 'stake';
  let foundPage: PageFAQ | undefined = undefined;

  try {
    const pages = await getFAQ(serverRuntimeConfig.faqContentUrl);

    foundPage = pages.find(
      (page: PageFAQ) => page['identification'] === pageIdentification,
    );
  } catch {
    // noop
  }

  return {
    props: {
      faqList: foundPage?.faq,
    },
    // 15 minutes
    // TODO: config
    revalidate: 900,
  };
};
