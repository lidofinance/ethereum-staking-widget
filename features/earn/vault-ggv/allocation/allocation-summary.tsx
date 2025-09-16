import { FC } from 'react';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatPercent } from 'shared/formatters/format-percent';

import { DataTableStyled, DataTableRowStyled } from './styles';

type AllocationSummaryProps = {
  apy?: number;
  totalTVL: number;
};

export const AllocationSummary: FC<AllocationSummaryProps> = ({
  apy,
  totalTVL,
}) => {
  return (
    <DataTableStyled>
      <DataTableRowStyled title="Total">
        {totalTVL || DATA_UNAVAILABLE}
      </DataTableRowStyled>
      <DataTableRowStyled title="APY">
        <FormatPercent value={apy} decimals="percent" fallback="-" />
      </DataTableRowStyled>
    </DataTableStyled>
  );
};
