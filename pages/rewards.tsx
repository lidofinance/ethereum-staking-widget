import { FC } from 'react';
import Head from 'next/head';

import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';

import { Layout } from 'shared/components';

import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { SupportOnlyL1Chains } from 'modules/web3';

const Rewards: FC = () => {
  return (
    <SupportOnlyL1Chains>
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

        <RewardsHistoryProvider>
          <TopCard />
          <RewardsList />
        </RewardsHistoryProvider>
      </Layout>
    </SupportOnlyL1Chains>
  );
};

export const getStaticProps = getDefaultStaticProps();

export default Rewards;
