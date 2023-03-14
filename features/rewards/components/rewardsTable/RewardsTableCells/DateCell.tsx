import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import Date from 'features/rewards/components/Date';

import { RewardsTableCellProps } from '../types';

export const DateCell: FC<RewardsTableCellProps> = (props) => {
  const { value, cellConfig } = props;

  return (
    <Td {...cellConfig} numeric>
      <Date blockTime={String(value)} />
    </Td>
  );
};
