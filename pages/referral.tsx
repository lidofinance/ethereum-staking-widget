import { FC } from 'react';
import Head from 'next/head';
import Layout from 'components/layout';

const ReferralPage: FC = () => {
  return (
    <Layout
      title="Referral"
      subtitle="Earn rewards by spreading the benefits of staking with Lido."
    >
      <Head>
        <title>Stake with Lido | Lido</title>
      </Head>
    </Layout>
  );
};

export default ReferralPage;
