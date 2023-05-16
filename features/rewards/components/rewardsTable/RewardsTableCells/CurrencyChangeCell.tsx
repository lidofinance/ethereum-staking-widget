import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { ChangeCellValueWrapper } from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const CurrencyChangeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, currency, data, cellConfig } = props;
  const isNegative = data?.direction === 'out' || data.type === 'withdrawal';

  return (
    <Td {...cellConfig} numeric>
      <ChangeCellValueWrapper negative={isNegative}>
        <span>{currency.symbol} </span>
        <NumberFormat number={value} currency />
      </ChangeCellValueWrapper>
    </Td>
  );
};
