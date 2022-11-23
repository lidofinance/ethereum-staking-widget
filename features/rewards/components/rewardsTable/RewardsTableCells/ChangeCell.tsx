import { FC } from 'react';
import { Td } from '@lidofinance/lido-ui';
import EthSymbol from 'features/rewards/components/EthSymbol';
import NumberFormat from 'features/rewards/components/NumberFormat';

import { ChangeCellValueWrapper } from './CellStyles';
import { RewardsTableCellProps } from '../types';

export const ChangeCell: FC<RewardsTableCellProps> = (props) => {
  const { value, data } = props;

  return (
    <Td numeric>
      <ChangeCellValueWrapper negative={data?.direction === 'out'}>
        <EthSymbol />
        <NumberFormat number={value} />
      </ChangeCellValueWrapper>
    </Td>
  );
};
