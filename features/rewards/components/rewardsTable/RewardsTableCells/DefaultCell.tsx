import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';

import { RewardsTableCellProps } from '../types';

export const DefaultCell: FC<RewardsTableCellProps> = (props): JSX.Element => {
  const { value, ...rest } = props;

  return <Td {...rest}>{String(value)}</Td>;
};
