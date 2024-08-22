import { FC } from 'react';
import { useRewardsHistory } from 'features/rewards/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './styles';
import { TitleStyle } from './styles';

export const RewardsListHeader: FC = () => {
  const { isWalletConnected, isSupportedChain } = useDappStatus();
  const { error, data } = useRewardsHistory();

  return (
    <RewardsListHeaderStyle data-testid="rewardsHeader">
      <TitleStyle>Reward history</TitleStyle>
      {!error &&
        data &&
        data?.events.length > 0 &&
        (!isWalletConnected || (isWalletConnected && isSupportedChain)) && (
          <>
            <LeftOptions />
            <RightOptions />
          </>
        )}
    </RewardsListHeaderStyle>
  );
};
