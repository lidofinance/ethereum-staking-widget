import { FC } from 'react';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './styles';
import { TitleStyle } from './styles';

export const RewardsListHeader: FC = () => {
  const { isDappActive } = useDappStatus();
  const { error, data } = useRewardsHistory();
  return (
    <RewardsListHeaderStyle data-testid="rewardsHeader">
      <TitleStyle>Reward history</TitleStyle>
      {isDappActive && !error && data && data?.events.length > 0 && (
        <>
          <LeftOptions />
          <RightOptions />
        </>
      )}
    </RewardsListHeaderStyle>
  );
};
