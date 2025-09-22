import { FC } from 'react';
import { parseEther } from 'viem';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';

import {
  DataTableStyled,
  DataTableRowStyled,
  FormatTokenStyled,
} from './styles';

type AllocationSummaryProps = {
  apy?: number;
  totalTvlUSD: number;
  totalTvlETH: number;
};

export const AllocationSummary: FC<AllocationSummaryProps> = ({
  apy,
  totalTvlUSD,
  totalTvlETH,
}) => {
  return (
    <DataTableStyled>
      <DataTableRowStyled title="Total">
        <FormatLargeAmount amount={totalTvlUSD} fallback="-" />
        <br />
        <FormatTokenStyled
          fallback="-"
          amount={parseEther(totalTvlETH.toString())}
          symbol={'ETH'}
          shortened
          data-testid="ggv-total-tvl-eth"
        />
      </DataTableRowStyled>
      <DataTableRowStyled title="APY">
        <FormatPercent value={apy} decimals="percent" fallback="-" />
      </DataTableRowStyled>
    </DataTableStyled>
  );
};
