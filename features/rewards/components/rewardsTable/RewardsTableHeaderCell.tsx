import { FC } from 'react';
import { Th } from '@lidofinance/lido-ui';
import EthSymbol from 'features/rewards/components/EthSymbol';

import { RewardsTableHeaderCellProps } from './types';

export const RewardsTableHeaderCell: FC<RewardsTableHeaderCellProps> = (
  props,
) => {
  const { value, field, currency } = props;

  const isChange = field === 'change';
  const isCurrencyChange = field === 'currencyChange';
  const isBalance = field === 'balance';

  if (isChange || isBalance) {
    return (
      <Th>
        <EthSymbol />
        {value}
      </Th>
    );
  }

  if (isCurrencyChange) {
    return (
      <Th>
        <span>{currency.symbol} </span>
        {value}
      </Th>
    );
  }

  return <Th>{value}</Th>;
};
