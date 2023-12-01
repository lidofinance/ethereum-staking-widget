import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { parseFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { FAQ_REVALIDATE_SECS } from 'config';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaq } from '../../utilsApi/get-faq';

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
  let pageRequestFAQ: PageFAQ | null = null;
  let pageClaimFAQ: PageFAQ | null = null;

  try {
    // FAQ request
    const rawRequestFaqData = await getFaq(
      'ethereum-staking-widget/faq-withdrawals-page-request-tab.md',
    );
    if (rawRequestFaqData) {
      pageRequestFAQ = await parseFAQ(rawRequestFaqData);
    }

    // FAQ claim
    const rawClaimFaqData = await getFaq(
      'ethereum-staking-widget/faq-withdrawals-page-claim-tab.md',
    );
    if (rawClaimFaqData) {
      pageClaimFAQ = await parseFAQ(rawClaimFaqData);
    }
  } catch {
    console.warn('FAQ not available on withdrawals page!');
  }
  const faqProps = {
    // We can't use `undefined` with `pageRequestFAQ` and `pageClaimFAQ`.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    pageRequestFAQ: pageRequestFAQ || null,
    pageClaimFAQ: pageClaimFAQ || null,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode, ...faqProps } };
};
