import { FC, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FAQItem, getFaqList } from 'lib/faqList';
import { Layout, Faq } from 'shared/components';
import { WrapForm, UnwrapForm, Wallet } from 'features/wrap';
import { Switch } from 'features/wrap/components';

interface WrapPageProps {
  faqList: FAQItem[];
}

const WrapPage: FC<WrapPageProps> = ({ faqList }) => {
  const router = useRouter();
  const { ref } = router.query;
  const isUnwrapMode = router.query.mode === 'unwrap';

  const toggleMode = useCallback(async () => {
    const { ref, embed } = router.query;

    const queryParams = new URLSearchParams();
    if (!isUnwrapMode) {
      queryParams.append('mode', 'unwrap');
    }
    if (ref) {
      queryParams.append('ref', ref as string);
    }
    if (embed) {
      queryParams.append('embed', embed as string);
    }

    const url =
      queryParams.toString().length > 0
        ? '/wrap?' + queryParams.toString()
        : '/wrap';
    await router.push(url);
  }, [router, isUnwrapMode]);

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
          '--REF--': ref ? `?ref=${ref}` : '',
          '--UNWRAP-REF--': ref ? `&ref=${ref}` : '',
        }}
      />
    </Layout>
  );
};

export default WrapPage;

export const getServerSideProps: GetServerSideProps<WrapPageProps> =
  async () => {
    // list of .md files from /faq/
    const fileList = [
      'wrap-what-is-wsteth',
      'wrap-how-can-i-get-wsteth',
      'wrap-how-can-i-use-wsteth',
      'wrap-do-i-get-my-staking-rewards-if-i-wrap-steth-to-wsteth',
      'wrap-do-i-need-to-claim-my-staking-rewards-f-i-wrap-steth-to-wsteth',
      'wrap-how-do-i-unwrap-wsteth-back-to-steth',
    ];
    const faqList = await getFaqList(fileList);

    return { props: { faqList } };
  };
