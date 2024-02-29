import { useTxCostInUsd } from 'shared/hooks';
import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import { useUnwrapFormData } from '../unwrap-form-context';

import { DataTableRow, DataTable } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice } from 'shared/formatters';

export const UnwrapStats = () => {
  const unwrapGasLimit = useUnwrapGasLimit();
  const {
    txCostUsd: unwrapTxCostInUsd,
    initialLoading: isUnwrapTxCostLoading,
  } = useTxCostInUsd(unwrapGasLimit);
  const { willReceiveStETH, isWillReceiveStETHLoading } = useUnwrapFormData();

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
          amount={willReceiveStETH}
          symbol="stETH"
          showAmountTip
          trimEllipsis
        />
      </DataTableRow>
    </DataTable>
  );
};
