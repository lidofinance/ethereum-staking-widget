import { FC } from 'react';
import CurrencySelector from 'features/rewards/components/CurrencySelector';
import { Export } from 'features/rewards/components/export';

import { RightOptionsWrapper } from './styles';
import { useRewardsHistory } from 'features/rewards/hooks/useRewardsHistory';

export const RightOptions: FC = () => {
  const {
    address,
    currencyObject,
    setCurrency,
    isUseArchiveExchangeRate,
    isOnlyRewards,
  } = useRewardsHistory();
  return (
    <RightOptionsWrapper>
      <CurrencySelector currency={currencyObject} onChange={setCurrency} />
      <Export
        currency={currencyObject}
        address={address}
        archiveRate={isUseArchiveExchangeRate}
        onlyRewards={isOnlyRewards}
      />
    </RightOptionsWrapper>
  );
};
