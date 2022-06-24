import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Wallet, OneinchPopup, StakeForm, LidoStats } from 'features/home';
import { Layout, Faq } from 'shared/components';
import { FAQItem, getFaqList } from 'lib/faqList';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => (
  <>
    <OneinchPopup modalView={true} />
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

const faqList = getFaqList([
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
]);

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return { props: { faqList: await faqList } };
};
