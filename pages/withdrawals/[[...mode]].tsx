import { FC, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useWeb3 } from 'reef-knot/web3-react';

import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { useRouter } from 'next/router';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

const Withdrawals: FC<WithdrawalsModePageProps> = ({ mode }) => {
  const { account } = useWeb3();
  // legacy routing support
  const { isReady, query, replace } = useRouter();
  const queryString = useSafeQueryString();
  useEffect(() => {
    if (isReady && query.tab === 'claim') {
      replace(`/withdrawals/claim${queryString}`);
    }
  }, [isReady, query.tab, queryString, replace]);

  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <WithdrawalsProvider mode={mode}>
        <NoSSRWrapper>
          {/* In order to simplify side effects of switching wallets we remount the whole widget, resetting all internal state */}
          <WithdrawalsTabs key={account ?? 'NO_ACCOUNT'} />
        </NoSSRWrapper>
      </WithdrawalsProvider>
    </Layout>
  );
};

export default Withdrawals;

type WithdrawalsModePageProps = {
  mode: 'request' | 'claim';
};

type WithdrawalsModePageParams = {
  mode: string;
};

export const getServerSideProps: GetServerSideProps<
  WithdrawalsModePageProps,
  WithdrawalsModePageParams
> = async ({ params }) => {
  const mode = params?.mode;
  if (!mode)
    return {
      redirect: { destination: '/withdrawals/request', permanent: true },
    };
  if (mode.length > 1 || (mode[0] !== 'request' && mode[0] !== 'claim'))
    return { notFound: true };
  return { props: { mode: mode[0] } };
};
