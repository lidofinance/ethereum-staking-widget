import { FC } from 'react';
import { useRewardsHistory } from 'features/rewards/hooks';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './styles';
import { TitleStyle } from './styles';

export const RewardsListHeader: FC = () => {
  const { error, data } = useRewardsHistory();
  return (
    <RewardsListHeaderStyle data-testid="rewardsHeader">
      <TitleStyle>Reward history</TitleStyle>
      <LeftOptions />
      {!error && data && data?.events.length > 0 && <RightOptions />}
    </RewardsListHeaderStyle>
  );
};
