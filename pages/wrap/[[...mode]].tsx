import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FAQItem, getFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig, FAQ_REVALIDATE_SECS } from 'config';
import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { serverAxios } from 'utilsApi/serverAxios';

const WrapPage: FC<WrapModePageProps> = ({ mode, faqList }) => {
  const key = useWeb3Key();

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <WrapUnwrapTabs key={key} mode={mode} faqList={faqList ?? undefined} />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
  faqList?: FAQItem[] | null;
};

type WrapModePageParams = {
  mode: ['unwrap'] | undefined;
};

export const getStaticPaths: GetStaticPaths<WrapModePageParams> = async () => {
  return {
    paths: [{ params: { mode: undefined } }, { params: { mode: ['unwrap'] } }],
    fallback: false, // return 404 on non match
  };
};

// we need [[...]] pattern for / and /unwrap
export const getStaticProps: GetStaticProps<
  WrapModePageProps,
  WrapModePageParams
> = async ({ params }) => {
  // FAQ
  const pageIdentification = 'wrap-and-unwrap';
  let foundPage: PageFAQ | undefined = undefined;

  try {
    const pages = await getFAQ(serverRuntimeConfig.faqContentUrl, {
      axiosInstance: serverAxios,
      cache: false,
    });

    foundPage = pages.find(
      (page: PageFAQ) => page['identification'] === pageIdentification,
    );
  } catch {
    console.warn('FAQ not available on wrap/unwrap page!');
  }
  // We can't use  `undefined` here.
  // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
  // Will be error: SerializableError: Error serializing `.faqListRequest` returned from `getStaticProps`.
  const faqProps = {
    faqList: foundPage?.faq || null,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap', ...faqProps } };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap', ...faqProps } };

  return { notFound: true };
};
