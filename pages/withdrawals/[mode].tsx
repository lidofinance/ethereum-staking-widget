import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { Layout } from 'shared/components';

import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { useWagmiKey } from 'shared/hooks/use-wagmi-key';

const Withdrawals: FC<WithdrawalsModePageParams> = ({ mode }) => {
  const key = useWagmiKey();

  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <WithdrawalsProvider mode={mode}>
        <WithdrawalsTabs key={key} />
      </WithdrawalsProvider>
    </Layout>
  );
};

export default Withdrawals;

type WithdrawalsModePageParams = {
  mode: 'request' | 'claim';
};

export const getStaticPaths: GetStaticPaths<
  WithdrawalsModePageParams
> = async () => {
  return {
    paths: [{ params: { mode: 'request' } }, { params: { mode: 'claim' } }],
    fallback: false, // return 404 on non match
  };
};

export const getStaticProps: GetStaticProps<
  WithdrawalsModePageParams,
  WithdrawalsModePageParams
> = async ({ params }) => {
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode }, revalidate: 60 };
};
