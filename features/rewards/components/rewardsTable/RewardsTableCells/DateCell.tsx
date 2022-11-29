import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import Date from 'features/rewards/components/Date';

import { RewardsTableCellProps } from '../types';

export const DateCell: FC<RewardsTableCellProps> = (props) => {
  const { value } = props;

  return (
    <Td numeric>
      <Date blockTime={String(value)} />
    </Td>
  );
};
