import { useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet, WrapFaq } from 'features/wrap';
import { Switch } from 'shared/components/switch';
import { getWrapUrl, getUnwrapUrl } from 'utils/getWrapUnwrapUrl';
import NoSSRWrapper from '../shared/components/no-ssr-wrapper';

const WrapPage: React.FC = () => {
  const router = useRouter();
  const { query } = router;
  const isUnwrapMode = router.query.mode === 'unwrap';

  const navRoutes = useMemo(() => {
    return [
      { name: 'Wrap', path: getWrapUrl(query) },
      { name: 'Unwrap', path: getUnwrapUrl(query) },
    ];
  }, [query]);

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <Switch checked={isUnwrapMode} routes={navRoutes} />

      <NoSSRWrapper>
        <Wallet />
        {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}
      </NoSSRWrapper>

      <WrapFaq />
    </Layout>
  );
};

export default WrapPage;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
