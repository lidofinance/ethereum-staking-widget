import { FC } from 'react';
import { Tooltip, Checkbox } from '@lidofinance/lido-ui';

import {
  TitleStyle,
  LeftOptionsWrapper,
  ItemWrapperStyle,
  CheckBoxesWrapper,
} from './LeftOptionsStyle';
import { LeftOptionsProps } from './types';

export const LeftOptions: FC<LeftOptionsProps> = (props) => {
  const {
    onlyRewards,
    useArchiveExchangeRate,
    setUseArchiveExchangeRate,
    setOnlyRewards,
  } = props;

  return (
    <LeftOptionsWrapper>
      <TitleStyle>Reward history</TitleStyle>
      <CheckBoxesWrapper>
        <ItemWrapperStyle>
          <Tooltip
            placement="bottom"
            title="Calculate USD values using an exchange rate at the time of the
        event. With this option disabled current exchange rate will always
        be used."
          >
            <div>
              <Checkbox
                checked={useArchiveExchangeRate}
                onChange={() =>
                  setUseArchiveExchangeRate(!useArchiveExchangeRate)
                }
                label="Historical stETH price"
              />
            </div>
          </Tooltip>
        </ItemWrapperStyle>
        <ItemWrapperStyle>
          <Tooltip
            placement="bottom"
            title="Display only transfers in the table. Other events will be hidden."
          >
            <div>
              <Checkbox
                checked={onlyRewards}
                onChange={() => setOnlyRewards(!onlyRewards)}
                label="Only Show Rewards"
              />
            </div>
          </Tooltip>
        </ItemWrapperStyle>
      </CheckBoxesWrapper>
    </LeftOptionsWrapper>
  );
};
