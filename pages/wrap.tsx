import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/dist/client/router';
import Layout from 'components/layout';
import { FAQItem, getFaqList } from 'lib/faqList';
import Faq from '../components/faq';

interface WrapPageProps {
  faqList: FAQItem[];
}

const WrapPage: FC<WrapPageProps> = ({ faqList }) => {
  const router = useRouter();
  const { ref } = router.query;

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
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
