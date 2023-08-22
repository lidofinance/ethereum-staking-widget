import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from 'shared/components';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';
import { WrapUnwrapTabs } from 'features/wsteth/wrap-unwrap-tabs';

const WrapPage: React.FC<WrapModePageProps> = ({ mode }) => {
  const { isReady, query, replace } = useRouter();
  const queryString = useSafeQueryString();

  // legacy routing support
  useEffect(() => {
    if (isReady && query.mode === 'unwrap') {
      void replace(`/wrap/unwrap${queryString}`);
    }
  }, [isReady, query.mode, queryString, replace]);

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <WrapUnwrapTabs mode={mode}></WrapUnwrapTabs>
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
};

type WrapModePageParams = {
  mode: string[] | undefined;
};

export const getServerSideProps: GetServerSideProps<
  WrapModePageProps,
  WrapModePageParams
> = async ({ params }) => {
  const mode = params?.mode;
  if (!mode) return { props: { mode: 'wrap' } };
  if (mode.length > 1) return { notFound: true };
  if (mode[0] === 'unwrap') return { props: { mode: 'unwrap' } };
  return { notFound: true };
};
