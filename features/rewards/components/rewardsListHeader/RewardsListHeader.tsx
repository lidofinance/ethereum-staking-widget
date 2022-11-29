import { FC } from 'react';
import { useRewardsHistory } from 'features/rewards/hooks';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './RewardListHeaderStyles';

export const RewardsListHeader: FC = () => {
  const {
    address,
    currencyObject,
    setCurrency,
    isUseArchiveExchangeRate,
    isOnlyRewards,
    setIsUseArchiveExchangeRate,
    setIsOnlyRewards,
  } = useRewardsHistory();

  return (
    <RewardsListHeaderStyle>
      <LeftOptions
        useArchiveExchangeRate={isUseArchiveExchangeRate}
        setUseArchiveExchangeRate={setIsUseArchiveExchangeRate}
        setOnlyRewards={setIsOnlyRewards}
        onlyRewards={isOnlyRewards}
      />
      <RightOptions
        currency={currencyObject}
        setCurrency={setCurrency}
        onlyRewards={isOnlyRewards}
        address={address}
        archiveRate={isUseArchiveExchangeRate}
      />
    </RewardsListHeaderStyle>
  );
};
