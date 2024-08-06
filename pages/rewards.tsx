import { FC } from 'react';
import Head from 'next/head';

import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';

import { Layout } from 'shared/components';
import { Fallback } from 'shared/wallet';

import { getDefaultStaticProps } from 'utilsApi/get-default-static-props';
import { useDappStatus } from 'shared/hooks/use-dapp-status';


const Rewards: FC = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();

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
      <RewardsHistoryProvider>
        {isWalletConnected && !isDappActive && <Fallback />}
        <TopCard />
        <RewardsList />
      </RewardsHistoryProvider>
    </Layout>
  );
};

export const getStaticProps = getDefaultStaticProps();

export default Rewards;
