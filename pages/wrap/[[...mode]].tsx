import { FC } from 'react';
import { GetStaticPaths } from 'next';
import Head from 'next/head';

import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';
import { Layout } from 'shared/components';
import { useWagmiKey } from 'shared/hooks/use-wagmi-key';
import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';

const WrapPage: FC<WrapModePageProps> = ({ mode }) => {
  const key = useWagmiKey();

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>
      <WrapUnwrapTabs mode={mode} key={key} />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
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
export const getStaticProps = getDefaultStaticProps<
  WrapModePageProps,
  WrapModePageParams
>(async ({ params }) => {
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap' } };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap' } };

  return { notFound: true };
});
