import { FC, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet, WrapFaq } from 'features/wrap';
import { Switch } from 'shared/components/switch';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';
import NoSsrWrapper from 'shared/components/no-ssr-wrapper';

const NAV_ROUTES = [
  { name: 'Wrap', path: '/wrap' },
  { name: 'Unwrap', path: '/wrap/unwrap' },
];

const WrapPage: FC<WrapModePageProps> = ({ mode }) => {
  const { isReady, query, replace } = useRouter();
  const isUnwrapMode = mode === 'unwrap';
  const queryString = useSafeQueryString();

  // legacy routing support
  useEffect(() => {
    if (isReady && query.mode === 'unwrap') {
      replace(`/wrap/unwrap${queryString}`);
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

      <Switch checked={isUnwrapMode} routes={NAV_ROUTES} />

      <NoSsrWrapper>
        <Wallet />
        {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}
      </NoSsrWrapper>

      <WrapFaq />
    </Layout>
  );
};

export default WrapPage;

type WrapModePageProps = {
  mode: 'wrap' | 'unwrap';
};

type WrapModePageParams = {
  mode: [] | ['unwrap'];
};

export const getStaticPaths: GetStaticPaths<WrapModePageParams> = async () => {
  return {
    paths: [{ params: { mode: [] } }, { params: { mode: ['unwrap'] } }],
    fallback: false, // return 404 on non match
  };
};

// we need [[...]] pattern for / and /unwrap
export const getStaticProps: GetStaticProps<
  WrapModePageProps,
  WrapModePageParams
> = async ({ params }) => {
  const mode = params?.mode;
  if (mode) {
    if (mode.length === 0) return { props: { mode: 'wrap' } };
    if (mode[0] === 'unwrap') return { props: { mode: 'unwrap' } };
  }
  return { notFound: true };
};
