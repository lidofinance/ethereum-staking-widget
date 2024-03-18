import { MaxUint256 } from '@ethersproject/constants';
import { TOKENS } from '@lido-sdk/constants';
import { DataTableRow } from '@lidofinance/lido-ui';
import { BigNumber } from 'ethers';
import { ReactNode, useMemo } from 'react';
import { FormatToken } from 'shared/formatters';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export type AllowanceDataTableRowProps = Omit<
  React.ComponentProps<typeof DataTableRow>,
  'title'
> & {
  title?: ReactNode;
  token: TOKENS.WSTETH | TOKENS.STETH | 'ETH';
  allowance?: BigNumber;
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
    return allowance && allowance.eq(MaxUint256);
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
