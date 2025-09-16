import { FC } from 'react';
import { Tr, Tbody } from '@lidofinance/lido-ui';

import { AllocationRow } from './allocation-row';
import { TableStyled, TheadStyled, ThStyled } from './styles';

export type Allocation = {
  protocol: string;
  chain: string;
  apy: number;
  allocation: number;
  tvl: number;
};
type AllocationProps = {
  allocation: Allocation[];
};

export const AllocationTable: FC<AllocationProps> = ({ allocation }) => {
  return (
    <TableStyled>
      <TheadStyled>
        <Tr>
          <ThStyled>Protocol</ThStyled>
          <ThStyled>Share</ThStyled>
          <ThStyled>TVL</ThStyled>
        </Tr>
      </TheadStyled>
      <Tbody>
        {allocation.map((item) => (
          <AllocationRow key={`${item.protocol}-${item.chain}`} data={item} />
        ))}
      </Tbody>
    </TableStyled>
  );
};
