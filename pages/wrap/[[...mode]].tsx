import { FC, useCallback, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet, WrapFaq } from 'features/wrap';
import { Switch } from 'features/wrap/components';
import { getQueryParamsString } from 'utils';
import NoSSRWrapper from '../../shared/components/no-ssr-wrapper';

const WrapPage: FC<WrapModePageProps> = ({ mode }) => {
  const { query, isReady, push, replace } = useRouter();
  const { ref, embed } = query;
  const isUnwrapMode = mode === 'unwrap';
  const toggleMode = useCallback(async () => {
    await push(
      `/wrap${isUnwrapMode ? '' : '/unwrap'}${getQueryParamsString(
        ref,
        embed,
      )}`,
    );
  }, [push, isUnwrapMode, ref, embed]);

  // legacy routing support
  useEffect(() => {
    if (isReady && query.mode === 'unwrap') {
      replace(`/wrap/unwrap${getQueryParamsString(query.ref, query.embed)}`);
    }
  }, [isReady, query, replace]);

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
