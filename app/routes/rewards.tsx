import Head from 'next/head';

import { TopCard, RewardsList } from 'features/rewards/features';
import RewardsHistoryProvider from 'providers/rewardsHistory';

import {
  Layout,
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';

/** `/rewards` — ported from `pages/rewards.tsx`. */
export default function RewardsPage() {
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
        <TopCard />
        <RewardsList />
      </RewardsHistoryProvider>
      <DisclaimerSection>
        <AprDisclaimer />
        <LegalDisclaimer />
      </DisclaimerSection>
    </Layout>
  );
}
