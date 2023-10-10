import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useWeb3 } from 'reef-knot/web3-react';

import { FAQItem, getFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig, FAQ_REVALIDATE_SECS } from 'config';
import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { Layout } from 'shared/components';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

const Withdrawals: FC<WithdrawalsModePageProps> = ({
  mode,
  faqListRequest,
  faqListClaim,
}) => {
  const { account, chainId } = useWeb3();

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
          <WithdrawalsTabs
            key={`${account ?? '_'}${chainId ?? '1'}`}
            faqListRequest={faqListRequest}
            faqListClaim={faqListClaim}
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
  faqListRequest?: FAQItem[];
  faqListClaim?: FAQItem[];
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
    const pages = await getFAQ(serverRuntimeConfig.faqContentUrl);

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
    faqListRequest: foundPageRequest?.faq,
    faqListClaim: foundPageClaim?.faq,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  if (!params?.mode) return { notFound: true };
  return { props: { mode: params.mode, ...faqProps } };
};
