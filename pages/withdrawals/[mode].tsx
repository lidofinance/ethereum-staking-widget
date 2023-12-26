import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import {
  FAQ_REVALIDATE_SECS,
  FAQ_WITHDRAWALS_PAGE_CLAIM_TAB_PATH,
  FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH,
} from 'config';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaqSSR } from 'utilsApi/faq';
import { FaqWithMeta } from 'utils/faq';

const Withdrawals: FC<WithdrawalsModePageProps> = ({
  mode,
  faqWithMetaWithdrawalsPageClaim,
  faqWithMetaWithdrawalsPageRequest,
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
            faqWithMetaWithdrawalsPageClaim={faqWithMetaWithdrawalsPageClaim}
            faqWithMetaWithdrawalsPageRequest={
              faqWithMetaWithdrawalsPageRequest
            }
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
  faqWithMetaWithdrawalsPageClaim: FaqWithMeta | null;
  faqWithMetaWithdrawalsPageRequest: FaqWithMeta | null;
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
  WithdrawalsModePageProps,
  WithdrawalsModePageParams
> = async ({ params }) => {
  // FAQ
  const faqProps = {
    faqWithMetaWithdrawalsPageRequest: await getFaqSSR(
      FAQ_WITHDRAWALS_PAGE_REQUEST_TAB_PATH,
    ),
    faqWithMetaWithdrawalsPageClaim: await getFaqSSR(
      FAQ_WITHDRAWALS_PAGE_CLAIM_TAB_PATH,
    ),
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode, ...faqProps } };
};
