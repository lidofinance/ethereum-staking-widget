import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { parseFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { FAQ_REVALIDATE_SECS } from 'config';
import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaq } from 'utilsApi/get-faq';

const WrapPage: FC<WrapModePageProps> = ({ mode, pageFAQ }) => {
  const key = useWeb3Key();

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <WrapUnwrapTabs key={key} mode={mode} pageFAQ={pageFAQ ?? undefined} />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
  pageFAQ: PageFAQ | null;
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
  let pageFAQ: PageFAQ | null = null;

  try {
    const rawFaqData = await getFaq(
      'ethereum-staking-widget/faq-wrap-and-unwrap-page.md',
    );
    if (rawFaqData) {
      pageFAQ = await parseFAQ(rawFaqData);
    }
  } catch {
    console.warn('FAQ not available on wrap/unwrap page!');
  }

  const pageFaqProps = {
    // We can't use `undefined` with `pageFAQ`.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    pageFAQ: pageFAQ || null,
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap', ...pageFaqProps } };
  if (mode[0] === 'unwrap')
    return { props: { mode: 'unwrap', ...pageFaqProps } };

  return { notFound: true };
};
