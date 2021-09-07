import { FC } from 'react';
import Head from 'next/head';
import Layout from 'components/layout';

const WrapPage: FC = () => {
  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
    </Layout>
  );
};

export default WrapPage;
