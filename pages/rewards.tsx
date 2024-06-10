import { FC } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Layout } from 'shared/components';
import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';
import { Fallback } from 'shared/wallet';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';

const Rewards: FC = () => {
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
      <RewardsHistoryProvider>
        <Fallback />
        <GoerliSunsetBanner />
        <TopCard />
        <RewardsList />
      </RewardsHistoryProvider>
    </Layout>
  );
};

export default Rewards;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 60,
  };
};
