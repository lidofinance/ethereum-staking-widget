import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useWeb3 } from 'reef-knot/web3-react';

import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import Page404 from 'pages/404';
import { dynamics } from 'config';

import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';

const Withdrawals: FC = () => {
  const { account } = useWeb3();
  if (dynamics.defaultChain === 1) return <Page404 />;
  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <WithdrawalsProvider>
        <NoSSRWrapper>
          {/* In order to simplify side effects of switching wallets we remount the whole widget, resetting all internal state */}
          <WithdrawalsTabs key={account ?? 'NO_ACCOUNT'} />
        </NoSSRWrapper>
      </WithdrawalsProvider>
    </Layout>
  );
};

export default Withdrawals;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
