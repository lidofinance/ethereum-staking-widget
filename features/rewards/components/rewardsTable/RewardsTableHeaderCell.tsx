import { FC } from 'react';
import { Th } from '@lidofinance/lido-ui';
import EthSymbol from 'features/rewards/components/EthSymbol';

import { RewardsTableHeaderCellProps } from './types';

export const RewardsTableHeaderCell: FC<RewardsTableHeaderCellProps> = (
  props,
) => {
  const { value, field, currency, cellConfig } = props;

  const showEthIcon = field === 'change' || field === 'balance';
  const showFiatIcon = field === 'currencyChange';

  return (
    <Th {...cellConfig}>
      {showEthIcon && <EthSymbol />}
      {showFiatIcon && <span>{currency.symbol} </span>}
      {value}
    </Th>
  );
};
