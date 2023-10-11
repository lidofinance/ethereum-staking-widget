import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { FAQItem, getFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig, FAQ_REVALIDATE_SECS } from 'config';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { serverAxios } from 'utilsApi/serverAxios';

const Withdrawals: FC<WithdrawalsModePageProps> = ({
  mode,
  faqListRequest,
  faqListClaim,
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
            faqListRequest={faqListRequest ?? undefined}
            faqListClaim={faqListClaim ?? undefined}
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
  faqListRequest?: FAQItem[] | null;
  faqListClaim?: FAQItem[] | null;
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
  const pageIdentificationRequest = 'withdrawals-request';
  const pageIdentificationClaim = 'withdrawals-claim';
  let foundPageRequest: PageFAQ | undefined = undefined;
  let foundPageClaim: PageFAQ | undefined = undefined;

  try {
    const pages = await getFAQ(serverRuntimeConfig.faqContentUrl, {
      axiosInstance: serverAxios,
      cache: false,
    });

    foundPageRequest = pages.find(
      (page: PageFAQ) => page['identification'] === pageIdentificationRequest,
    );
    foundPageClaim = pages.find(
      (page: PageFAQ) => page['identification'] === pageIdentificationClaim,
    );
  } catch {
    // noop
  }
  const faqProps = {
    // We can't use  `undefined` here.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    // Will be error: SerializableError: Error serializing `.faqListRequest` returned from `getStaticProps`.
    faqListRequest: foundPageRequest?.faq || null,
    faqListClaim: foundPageClaim?.faq || null,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode, ...faqProps } };
};
