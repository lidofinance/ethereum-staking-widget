import { ReactNode, useMemo } from 'react';
import { maxUint256 } from 'viem';
import { DataTableRow } from '@lidofinance/lido-ui';

import { LIDO_TOKENS_VALUES } from 'consts/tokens';
import { FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export type AllowanceDataTableRowProps = Omit<
  React.ComponentProps<typeof DataTableRow>,
  'title'
> & {
  title?: ReactNode;
  token: LIDO_TOKENS_VALUES;
  allowance?: bigint;
  loading?: boolean;
  isBlank?: boolean;
};

export const AllowanceDataTableRow = ({
  token,
  allowance,
  isBlank,
  title = 'Allowance',
  ...rest
}: AllowanceDataTableRowProps) => {
  const isInfiniteAllowance = useMemo(() => {
    return allowance === maxUint256;
  }, [allowance]);
  return (
    <DataTableRow title={title} {...rest}>
      {isBlank ? (
        '-'
      ) : isInfiniteAllowance ? (
        'Infinite'
      ) : (
        <FormatToken amount={allowance} symbol={getTokenDisplayName(token)} />
      )}
    </DataTableRow>
  );
};
