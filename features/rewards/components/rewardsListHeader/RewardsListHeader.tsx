import { FC } from 'react';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useDappStatus } from 'modules/web3';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './styles';
import { TitleStyle } from './styles';

export const RewardsListHeader: FC = () => {
  const { isSupportedChain, isDappActiveOnL2 } = useDappStatus();
  const { error, data } = useRewardsHistory();

  return (
    <RewardsListHeaderStyle data-testid="rewardsHeader">
      <TitleStyle>Reward history</TitleStyle>
      {!error &&
        data &&
        data?.events.length > 0 &&
        (isSupportedChain || !isDappActiveOnL2) && (
          <>
            <LeftOptions />
            <RightOptions />
          </>
        )}
    </RewardsListHeaderStyle>
  );
};
