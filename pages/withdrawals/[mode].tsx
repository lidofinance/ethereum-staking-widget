import type { FC } from 'react';
import type { GetStaticPaths } from 'next';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

import { Withdrawals, type WithdrawalsMode } from 'features/withdrawals';

const WithdrawalsPage: FC<WithdrawalsModePageParams> = ({ mode }) => {
  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <Withdrawals mode={mode} />
    </Layout>
  );
};

export default WithdrawalsPage;

type WithdrawalsModePageParams = {
  mode: WithdrawalsMode;
};

export const getStaticPaths: GetStaticPaths<WithdrawalsModePageParams> = () => {
  return {
    paths: [{ params: { mode: 'request' } }, { params: { mode: 'claim' } }],
    fallback: false, // return 404 on non match
  };
};

export const getStaticProps = getDefaultStaticProps<
  WithdrawalsModePageParams,
  WithdrawalsModePageParams
>('/withdrawals', async ({ params }) => {
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode } };
});
