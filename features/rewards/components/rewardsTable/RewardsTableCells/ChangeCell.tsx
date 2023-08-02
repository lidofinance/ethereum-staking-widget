import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';

import {
  ChangeCellValueWrapper,
  OnlyMobileChangeCellValueWrapper,
} from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const ChangeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, data, currency, cellConfig } = props;
  const isNegative = data?.direction === 'out' || data.type === 'withdrawal';

  return (
    <Td {...cellConfig} numeric>
      <ChangeCellValueWrapper negative={isNegative}>
        <EthSymbol />
        <NumberFormat number={value} />
      </ChangeCellValueWrapper>
      <OnlyMobileChangeCellValueWrapper negative={isNegative}>
        <span>{currency.symbol} </span>
        <NumberFormat number={data.currencyChange} currency />
      </OnlyMobileChangeCellValueWrapper>
    </Td>
  );
};
