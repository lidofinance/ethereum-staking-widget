import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import { capitalize } from 'features/rewards/utils';
import IndexerLink from 'features/rewards/components/IndexerLink';
import Date from 'features/rewards/components/Date';

import { OnlyMobileCellValueWrapper, TypeCellValueWrapper } from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const TypeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, data, cellConfig } = props;

  return (
    <Td {...cellConfig}>
      <OnlyMobileCellValueWrapper>
        <Date blockTime={data.blockTime} />
      </OnlyMobileCellValueWrapper>
      <TypeCellValueWrapper>
        {capitalize(String(value))}{' '}
        {value === 'transfer' && data.direction && capitalize(data.direction)}
        <IndexerLink transactionHash={data.transactionHash} />
      </TypeCellValueWrapper>
    </Td>
  );
};
