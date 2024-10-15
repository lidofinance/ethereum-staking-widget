import { FC } from 'react';
import Head from 'next/head';

import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';

import { Layout } from 'shared/components';

import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { SupportOnlyL1Chains } from 'providers/supported-chain';

const Rewards: FC = () => {
  return (
    <Layout
      title="Reward History"
      subtitle="Track your Ethereum staking rewards with Lido"
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
      <SupportOnlyL1Chains>
        <RewardsHistoryProvider>
          <TopCard />
          <RewardsList />
        </RewardsHistoryProvider>
      </SupportOnlyL1Chains>
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps();

export default Rewards;
