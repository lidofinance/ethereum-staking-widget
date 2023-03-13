import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { RewardsTableCellProps } from '../types';

export const AprCell: FC<RewardsTableCellProps> = (props) => {
  const { value, cellConfig } = props;

  return (
    <Td {...cellConfig}>
      {value ? <NumberFormat number={value} percent /> : '-'}
    </Td>
  );
};
