import { FC } from 'react';
import { Tr, Td } from '@lidofinance/lido-ui';
import { parseEther } from 'viem';

import { FormatLargeAmount } from 'shared/formatters/format-large-amount';

import { Allocation } from './allocation-Table';
import { FormatTokenStyled } from './styles';

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
      <Td align="right">{data.allocation}%</Td>
      <Td align="right">
        <FormatLargeAmount amount={data.tvlUSD} fallback="-" />
        <br />
        <FormatTokenStyled
          fallback="-"
          amount={parseEther(data.tvlETH.toString())}
          symbol={'ETH'}
          shortened
        />
      </Td>
    </Tr>
  );
};
