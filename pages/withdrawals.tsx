import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from '../shared/components/no-ssr-wrapper';
import Page404 from './404';
import { dynamics } from 'config';

const Withdrawals: FC = () => {
  if (dynamics.defaultChain === 1) return <Page404 />;

  return (
    <>
      <Layout
        title="Withdrawals"
        subtitle="Request stETH/wstETH withdrawal and claim ETH"
      >
        <Head>
          <title>Stake with Lido | Lido</title>
        </Head>

        <WithdrawalsProvider>
          <NoSSRWrapper>
            <WithdrawalsTabs />
          </NoSSRWrapper>
        </WithdrawalsProvider>
      </Layout>
    </>
  );
};

export default Withdrawals;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
