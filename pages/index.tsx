import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Wallet, StakeForm, LidoStats, StakeFaq } from 'features/home';
import { Layout } from 'shared/components';
import NoSSRWrapper from '../shared/components/no-ssr-wrapper';

const Home: FC = () => (
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
      <StakeFaq />
    </Layout>
  </>
);

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
