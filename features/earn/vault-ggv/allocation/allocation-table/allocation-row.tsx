import { FC } from 'react';
import { Tr, Td } from '@lidofinance/lido-ui';

import { Allocation } from './allocation-Table';

type AllocationRowProps = {
  data: Allocation;
};

export const AllocationRow: FC<AllocationRowProps> = (props) => {
  const { data } = props;

  return (
    <Tr>
      <Td>
        {data.protocol}-{data.chain}
      </Td>
      <Td>{data.allocation}%</Td>
      <Td>{data.tvl}</Td>
    </Tr>
  );
};
