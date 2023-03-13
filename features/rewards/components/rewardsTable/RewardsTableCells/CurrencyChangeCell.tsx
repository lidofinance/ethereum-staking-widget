import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { ChangeCellValueWrapper } from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const CurrencyChangeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, currency, data, cellConfig } = props;

  return (
    <Td {...cellConfig} numeric>
      <ChangeCellValueWrapper negative={data?.direction === 'out'}>
        <span>{currency.symbol} </span>
        <NumberFormat number={value} currency />
      </ChangeCellValueWrapper>
    </Td>
  );
};
