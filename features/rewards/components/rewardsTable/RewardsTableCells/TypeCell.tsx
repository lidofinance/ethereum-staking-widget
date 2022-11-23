import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import { capitalize } from 'features/rewards/utils';
import IndexerLink from 'features/rewards/components/IndexerLink';

import { TypeCellValueWrapper } from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const TypeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, data } = props;

  return (
    <Td>
      <TypeCellValueWrapper>
        {capitalize(String(value))}{' '}
        {data.direction && capitalize(data.direction)}{' '}
        <IndexerLink transactionHash={data.transactionHash} />
      </TypeCellValueWrapper>
    </Td>
  );
};
