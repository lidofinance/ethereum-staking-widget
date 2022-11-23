import { FC } from 'react';

import { RewardsListWrapper } from 'features/rewards/components/rewardsListWrapper';
import { RewardsListHeader } from 'features/rewards/components/rewardsListHeader';
import { RewardsListContent } from 'features/rewards/components/rewardsListContent';

export const RewardsList: FC = () => {
  return (
    <RewardsListWrapper>
      <RewardsListHeader />
      <RewardsListContent />
    </RewardsListWrapper>
  );
};
