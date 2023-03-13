import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';

import { RewardsTableCellProps } from '../types';

export const DefaultCell: FC<RewardsTableCellProps> = (props): JSX.Element => {
  const { value, cellConfig, ...rest } = props;

  return (
    <Td {...cellConfig} {...rest}>
      {String(value)}
    </Td>
  );
};
