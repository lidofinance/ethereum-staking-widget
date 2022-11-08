import { FC } from 'react';
import { GetServerSideProps } from 'next';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';
import Head from 'next/head';
import { Wallet, StakeForm, LidoStats } from 'features/home';
import { Layout, Faq } from 'shared/components';
import { FAQItem, getFaqList } from 'lib/faqList';
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
    </>
  );
};

export default Home;

const faqList = getFaqList([
  'index-what-is-lido',
  'index-how-does-lido-work',
  'index-what-is-liquid-staking',
  'index-what-is-steth',
  'index-what-is-ldo',
  'index-how-is-lido-secure',
  'index-what-is-insurance-fund-for',
  'index-where-can-i-cover-my-steth',
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
