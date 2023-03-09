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
  return (
    <Td {...cellConfig} numeric>
      <ChangeCellValueWrapper negative={data?.direction === 'out'}>
        <EthSymbol />
        <NumberFormat number={value} />
      </ChangeCellValueWrapper>
      <OnlyMobileChangeCellValueWrapper negative={data?.direction === 'out'}>
        <span>{currency.symbol} </span>
        <NumberFormat number={data.currencyChange} currency />
      </OnlyMobileChangeCellValueWrapper>
    </Td>
  );
};
