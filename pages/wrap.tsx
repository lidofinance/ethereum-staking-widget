import { FC, useCallback, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FAQItem, getFaqList } from 'lib/faqList';
import { Layout, Faq } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet } from 'features/wrap';
import { Switch } from 'features/wrap/components';

interface WrapPageProps {
  faqList: FAQItem[];
}

const getQueryParams = (
  isUnwrapMode: boolean,
  ref: string,
  embed: string,
  exclude?: Array<string>,
): string => {
  const queryParams = new URLSearchParams();

  if (!isUnwrapMode) {
    queryParams.append('mode', 'unwrap');
  }
  if (ref) {
    queryParams.append('ref', ref);
  }
  if (embed) {
    queryParams.append('embed', embed);
  }

  if (exclude) {
    exclude.forEach((item) => {
      if (queryParams.has(item)) {
        queryParams.delete(item);
      }
    });
  }

  return queryParams.toString();
};

const WrapPage: FC<WrapPageProps> = ({ faqList }) => {
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

      <Wallet />

      {isUnwrapMode ? <UnwrapForm /> : <WrapForm />}

      <Faq
        faqList={faqList}
        replacements={{
          '--QUERY-PARAMS--':
            queryParamsWithoutMode.length > 0
              ? `?${queryParamsWithoutMode}`
              : '',
          '--QUERY-PARAMS-WITHOUT-MODE--':
            queryParamsWithoutMode.length > 0
              ? `&${queryParamsWithoutMode}`
              : '',
        }}
      />
    </Layout>
  );
};

export default WrapPage;

export const getStaticProps: GetStaticProps<WrapPageProps> = async () => ({
  props: {
    faqList: await getFaqList([
      'wrap-what-is-wsteth',
      'wrap-how-can-i-get-wsteth',
      'wrap-how-can-i-use-wsteth',
      'wrap-do-i-get-my-staking-rewards-if-i-wrap-steth-to-wsteth',
      'wrap-do-i-need-to-claim-my-staking-rewards-f-i-wrap-steth-to-wsteth',
      'wrap-how-do-i-unwrap-wsteth-back-to-steth',
    ]),
  },
});
