import { FC } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { FAQ_REVALIDATE_SECS, FAQ_WRAP_AND_UNWRAP_PAGE_PATH } from 'config';
import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import { getFaqSSR } from 'utilsApi/faq';
import { FaqWithMeta } from 'utils/faq';

const WrapPage: FC<WrapModePageProps> = ({ mode, faqWithMeta }) => {
  const key = useWeb3Key();

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <WrapUnwrapTabs mode={mode} key={key} faqWithMeta={faqWithMeta} />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
  faqWithMeta: FaqWithMeta | null;
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
  const faqProps = {
    faqWithMeta: await getFaqSSR(FAQ_WRAP_AND_UNWRAP_PAGE_PATH),
    revalidate: FAQ_REVALIDATE_SECS,
  };

  // Mode
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap', ...faqProps } };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap', ...faqProps } };

  return { notFound: true };
};
