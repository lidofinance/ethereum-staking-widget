import type { FC } from 'react';
import type { GetStaticPaths } from 'next';
import Head from 'next/head';

import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout, DisclaimerSection, LegalDisclaimer } from 'shared/components';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const Withdrawals: FC<WithdrawalsModePageParams> = ({ mode }) => {
  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <WithdrawalsProvider mode={mode}>
        <WithdrawalsTabs />
      </WithdrawalsProvider>
      <DisclaimerSection>
        <LegalDisclaimer />
      </DisclaimerSection>
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

export const getStaticProps = getDefaultStaticProps<
  WithdrawalsModePageParams,
  WithdrawalsModePageParams
>('/withdrawals', async ({ params }) => {
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode } };
});
