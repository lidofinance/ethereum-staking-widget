import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  IndexWallet,
  LidoStats,
  StakeForm,
  ReferralCard,
} from 'components/indexPage';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { FAQItem, getFaqList } from 'lib/faqList';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => {
  const contractRpc = useSTETHContractRPC();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <IndexWallet />
      <StakeForm />
      <ReferralCard />
      <LidoStats />
      <Faq
        faqList={faqList}
        replacements={{
          '%LIDO-FEE%':
            lidoFee.initialLoading || !lidoFee.data
              ? DATA_UNAVAILABLE
              : `${lidoFee.data / 100}%`,
        }}
      />
    </Layout>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // list of .md files from /faq/
  const fileList = [
    'index-what-is-lido',
    'index-how-does-lido-work',
    'index-what-is-liquid-staking',
    'index-what-is-steth',
    'index-what-is-ldo',
    'index-how-is-lido-secure',
    'index-self-staking-vs-liquid-staking',
    'index-risks-of-staking-with-lido',
    'index-lido-fee',
  ];
  const faqList = await getFaqList(fileList);

  return { props: { faqList } };
};
