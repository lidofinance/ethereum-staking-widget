import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { PageFAQ } from '@lidofinance/ui-faq';

import { FAQ_REVALIDATE_SECS } from 'config';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaqSSR } from 'utilsApi/faq';

const Withdrawals: FC<WithdrawalsModePageProps> = ({
  mode,
  pageRequestFAQ,
  pageClaimFAQ,
}) => {
  const key = useWeb3Key();

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
          <WithdrawalsTabs
            key={key}
            pageRequestFAQ={pageRequestFAQ ?? undefined}
            pageClaimFAQ={pageClaimFAQ ?? undefined}
          />
        </NoSSRWrapper>
      </WithdrawalsProvider>
    </Layout>
  );
};

export default Withdrawals;

type WithdrawalsModePageParams = {
  mode: 'request' | 'claim';
};

type WithdrawalsModePageProps = WithdrawalsModePageParams & {
  pageRequestFAQ?: PageFAQ | null;
  pageClaimFAQ?: PageFAQ | null;
  // IPFS actual only!
  eTag?: string | null;
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
  // FAQ
  const faqProps = {
    pageRequestFAQ: (await getFaqSSR('/faq-withdrawals-page-request-tab.md'))
      ?.faq,
    pageClaimFAQ: (await getFaqSSR('/faq-withdrawals-page-claim-tab.md'))?.faq,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode, ...faqProps } };
};
