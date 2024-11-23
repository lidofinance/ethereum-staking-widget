import { ReactNode, useMemo } from 'react';
import { maxUint256 } from 'viem';
import { DataTableRow } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { TOKENS_TO_WITHDRAWLS } from 'features/withdrawals/types/tokens-withdrawable';

export type AllowanceDataTableRowProps = Omit<
  React.ComponentProps<typeof DataTableRow>,
  'title'
> & {
  title?: ReactNode;
  token: TOKENS_TO_WRAP | TOKENS_TO_WITHDRAWLS;
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
    return allowance && allowance === maxUint256;
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
