import { FC, useCallback, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet, WrapFaq } from 'features/wrap';
import { Switch } from 'features/wrap/components';
import { getQueryParams } from 'utils';
import NoSSRWrapper from '../shared/components/no-ssr-wrapper';

const WrapPage: FC = () => {
  const router = useRouter();
  const { ref, embed } = router.query;
  const isUnwrapMode = router.query.mode === 'unwrap';

  const queryParams = useMemo(() => {
    return getQueryParams(isUnwrapMode, ref as string, embed as string);
  }, [isUnwrapMode, ref, embed]);

  const queryParamsWithoutMode = useMemo(() => {
    return getQueryParams(isUnwrapMode, ref as string, embed as string, [
      'mode',
    ]);
  }, [isUnwrapMode, ref, embed]);

  const toggleMode = useCallback(async () => {
    let qs = '';
    if (isUnwrapMode) {
      qs = queryParamsWithoutMode;
    } else {
      qs = queryParams;
    }

    const url = qs.length > 0 ? '/wrap?' + qs : '/wrap';
    await router.push(url);
  }, [router, isUnwrapMode, queryParams, queryParamsWithoutMode]);

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Wrap | Lido</title>
      </Head>

      <Switch
        checked={isUnwrapMode}
        onClick={toggleMode}
        checkedLabel="Wrap"
        uncheckedLabel="Unwrap"
      />

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
