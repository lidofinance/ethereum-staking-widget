import { FC } from 'react';
import Head from 'next/head';
import { Layout } from 'shared/components';
import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';
import { useCurrency } from 'shared/hooks';
import { Fallback } from 'shared/wallet';

const Rewards: FC = () => {
  const { cookiesCurrency } = useCurrency();
  return (
    <Layout
      title="Reward History"
      subtitle="Track your Ethereum staking rewards with Lido."
      containerSize="content"
    >
      <Head>
        <title>Track your Ethereum staking rewards | Lido</title>
        <meta
          name="description"
          content="Keep track of your daily Ethereum staking rewards using our stETH
        reward tracker. View stETH balances, historical rewards and transfers."
        />
      </Head>
      <RewardsHistoryProvider cookiesCurrency={cookiesCurrency}>
        <Fallback />
        <TopCard />
        <RewardsList />
      </RewardsHistoryProvider>
    </Layout>
  );
};

export default Rewards;

export const getServerSideProps = async () => {
  return { props: {} };
};
