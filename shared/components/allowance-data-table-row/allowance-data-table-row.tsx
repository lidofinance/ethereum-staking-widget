import { ReactNode, useMemo } from 'react';
import { DataTableRow } from '@lidofinance/lido-ui';

import { MAX_UINT_256 } from 'modules/web3';
import { FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { TOKENS_WRAPPABLE } from '../../../features/wsteth/shared/types';
import { TOKENS_WITHDRAWABLE } from '../../../features/withdrawals/types/tokens-withdrawable';

export type AllowanceDataTableRowProps = Omit<
  React.ComponentProps<typeof DataTableRow>,
  'title'
> & {
  title?: ReactNode;
  token: TOKENS_WRAPPABLE | TOKENS_WITHDRAWABLE;
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
    return allowance && allowance === MAX_UINT_256;
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
