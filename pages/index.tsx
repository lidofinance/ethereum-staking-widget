import { FC } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { LidoStats, StakeForm, Wallet } from 'features/home';
import { Faq, Layout } from 'shared/components';
import { FAQItem, getFaqList } from 'lib/faqList';
import Metrics from 'utilsApi/metrics';

interface HomeProps {
  faqList: FAQItem[];
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
      <Wallet />
      <StakeForm />
      <LidoStats />
      <Faq faqList={faqList} />
    </Layout>
  </>
);

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  Metrics.request.requestCounter.inc({ route: '/pages/index' });

  return {
    props: {
      faqList: await getFaqList([
        'index-what-is-lido',
        'index-how-does-lido-work',
        'index-what-is-liquid-staking',
        'index-what-is-steth',
        'index-what-is-ldo',
        'index-how-is-lido-secure',
        'index-self-staking-vs-liquid-staking',
        'index-risks-of-staking-with-lido',
        'index-lido-fee',
        'index-steth-can-be-converted-to-eth',
        'lido-referral-program',
        'index-how-to-claim-referral-reward',
      ]),
    },
  };
};
