import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import NumberFormat from 'features/rewards/components/NumberFormat';
import EthSymbol from 'features/rewards/components/EthSymbol';

import { RewardsTableCellProps } from '../types';

export const BalanceCell: FC<RewardsTableCellProps> = (props) => {
  const { value } = props;

  return (
    <Td numeric>
      <EthSymbol />
      <NumberFormat number={value} />
    </Td>
  );
};
