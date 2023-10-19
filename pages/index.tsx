import { FC } from 'react';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { Stake } from 'features/stake';

const Home: FC = () => {
  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
      <Stake />
    </Layout>
  );
};

export default Home;
