import { FC } from 'react';

import { FormatPercent } from 'shared/formatters/format-percent';
import { FormatLargeAmount } from 'shared/formatters/format-large-amount';

import {
  DataTableStyled,
  DataTableRowStyled,
  FormatTokenStyled,
  DataTableRowContentStyled,
} from './styles';

type AllocationSummaryProps = {
  apy?: number;
  totalTvlUsd?: number;
  totalTvlWei?: bigint;
};

export const AllocationSummary: FC<AllocationSummaryProps> = ({
  apy,
  totalTvlUsd,
  totalTvlWei,
}) => {
  return (
    <DataTableStyled>
      <DataTableRowStyled title="Total">
        <DataTableRowContentStyled>
          {totalTvlUsd !== undefined && (
            <FormatLargeAmount
              amount={totalTvlUsd}
              data-testid="vault-allocation-total-tvl-usd"
            />
          )}
          {totalTvlWei !== undefined && (
            <FormatTokenStyled
              amount={totalTvlWei}
              symbol={'ETH'}
              shortened
              data-testid="vault-allocation-total-tvl-eth"
            />
          )}
        </DataTableRowContentStyled>
      </DataTableRowStyled>
      {apy !== undefined && (
        <DataTableRowStyled title="APY">
          <FormatPercent
            value={apy}
            decimals="percent"
            data-testid="vault-allocation-apy"
          />
        </DataTableRowStyled>
      )}
    </DataTableStyled>
  );
};
