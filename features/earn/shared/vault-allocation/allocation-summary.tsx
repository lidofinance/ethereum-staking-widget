import { FC } from 'react';

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
  totalTvlETH: bigint;
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
          amount={totalTvlETH}
          symbol={'ETH'}
          shortened
          data-testid="ggv-allocation-total-tvl-eth"
        />
      </DataTableRowStyled>
      <DataTableRowStyled title="APY">
        <FormatPercent value={apy} decimals="percent" fallback="-" />
      </DataTableRowStyled>
    </DataTableStyled>
  );
};
