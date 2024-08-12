import { FC } from 'react';
import { Tooltip, Checkbox } from '@lidofinance/lido-ui';

import { useRewardsHistory } from 'features/rewards/hooks/useRewardsHistory';
import { LeftOptionsWrapper } from './styles';

export const LeftOptions: FC = () => {
  const {
    isUseArchiveExchangeRate,
    isIncludeTransfers,
    setIsUseArchiveExchangeRate,
    setIsIncludeTransfers,
  } = useRewardsHistory();

  return (
    <LeftOptionsWrapper>
      <Tooltip
        placement="bottom"
        title="Display only rewards in the table. Other events will be hidden."
      >
        <Checkbox
          checked={isIncludeTransfers}
          onChange={() => setIsIncludeTransfers(!isIncludeTransfers)}
          data-testid="includeTransfersCheckbox"
          label="Include transfers"
        />
      </Tooltip>
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
          data-testid="historicalStEthCheckbox"
          label="Historical stETH price"
        />
      </Tooltip>
    </LeftOptionsWrapper>
  );
};
