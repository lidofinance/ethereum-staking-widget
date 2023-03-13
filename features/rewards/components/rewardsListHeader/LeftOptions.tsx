import { FC } from 'react';
import { Tooltip, Checkbox } from '@lidofinance/lido-ui';

import { LeftOptionsWrapper } from './styles';
import { useRewardsHistory } from 'features/rewards/hooks/useRewardsHistory';

export const LeftOptions: FC = () => {
  const {
    isUseArchiveExchangeRate,
    isOnlyRewards,
    setIsUseArchiveExchangeRate,
    setIsOnlyRewards,
  } = useRewardsHistory();

  return (
    <LeftOptionsWrapper>
      <Tooltip
        placement="bottom"
        title="Calculate USD values using an exchange rate at the time of the
        event. With this option disabled current exchange rate will always
        be used."
      >
        <Checkbox
          checked={isUseArchiveExchangeRate}
          onChange={() =>
            setIsUseArchiveExchangeRate(!isUseArchiveExchangeRate)
          }
          label="Historical stETH price"
        />
      </Tooltip>
      <Tooltip
        placement="bottom"
        title="Display only transfers in the table. Other events will be hidden."
      >
        <Checkbox
          checked={isOnlyRewards}
          onChange={() => setIsOnlyRewards(!isOnlyRewards)}
          label="Only Show Rewards"
        />
      </Tooltip>
    </LeftOptionsWrapper>
  );
};
