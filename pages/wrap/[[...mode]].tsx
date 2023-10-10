import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FAQItem, getFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig, FAQ_REVALIDATE_SECS } from 'config';
import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';

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

      <WrapUnwrapTabs key={key} mode={mode} faqList={faqList} />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
  faqList?: FAQItem[];
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
    const pages = await getFAQ(serverRuntimeConfig.faqContentUrl);

    foundPage = pages.find(
      (page: PageFAQ) => page['identification'] === pageIdentification,
    );
  } catch {
    // noop
  }
  const faqProps = { faqList: foundPage?.faq, revalidate: FAQ_REVALIDATE_SECS };

  // Mode
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap', ...faqProps } };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap', ...faqProps } };

  return { notFound: true };
};
