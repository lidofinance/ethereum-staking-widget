import { useWatch } from 'react-hook-form';
import { DataTableRow, DataTable } from '@lidofinance/lido-ui';

import { useTxCostInUsd } from 'shared/hooks';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice } from 'shared/formatters';

import { useDebouncedStethByWsteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';
import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import type { UnwrapFormInputType } from '../unwrap-form-context';

export const UnwrapStats = () => {
  const amount = useWatch<UnwrapFormInputType, 'amount'>({ name: 'amount' });
  const unwrapGasLimit = useUnwrapGasLimit();
  const {
    txCostUsd: unwrapTxCostInUsd,
    initialLoading: isUnwrapTxCostLoading,
  } = useTxCostInUsd(unwrapGasLimit);

  const { data: willReceiveStETH, initialLoading: isWillReceiveStETHLoading } =
    useDebouncedStethByWsteth(amount);

  return (
    <DataTable>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={isUnwrapTxCostLoading}
      >
        <FormatPrice amount={unwrapTxCostInUsd} />
      </DataTableRow>
      <DataTableRowStethByWsteth />
      <DataTableRow
        title="You will receive"
        loading={isWillReceiveStETHLoading}
      >
        <FormatToken
          data-testid="youWillReceive"
          fallback="-"
          amount={willReceiveStETH}
          symbol="stETH"
          showAmountTip
          trimEllipsis
        />
      </DataTableRow>
    </DataTable>
  );
};
