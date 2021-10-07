import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useContractSWR, useSTETHContractRPC } from '@lido-sdk/react';
import { DATA_UNAVAILABLE } from 'config';
import { IndexWallet, LidoStats, StakeForm } from 'components/indexPage';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { useUniqueConnector } from 'hooks';
import { OneInchPopup } from 'components/popups';
import { FAQItem, getFaqList } from 'lib/faqList';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => {
  const contractRpc = useSTETHContractRPC();

  const lidoFee = useContractSWR({
    contract: contractRpc,
    method: 'getFee',
  });

  const isUniqueConnector = useUniqueConnector();

  return (
    <>
      <OneInchPopup isUniqueConnector={isUniqueConnector} />

      <Layout
        title="Stake Ether"
        subtitle="Stake ETH and receive stETH while staking."
      >
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>
        <IndexWallet />
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // list of .md files from ./faq
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
    'index-steth-can-be-converted-to-eth',
    'lido-referral-program',
    'index-how-to-claim-referral-reward',
  ];
  const faqList = await getFaqList(fileList);

  return { props: { faqList } };
};
