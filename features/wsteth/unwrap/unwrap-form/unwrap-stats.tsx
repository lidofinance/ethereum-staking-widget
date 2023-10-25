import { useTxCostInUsd } from 'shared/hooks';
import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import { useUnwrapFormData } from '../unwrap-form-context';

import { DataTableRow } from '@lidofinance/lido-ui';
import { StatsDataTable } from 'features/wsteth/shared/styles';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice } from 'shared/formatters';

export const UnwrapStats = () => {
  const unwrapGasLimit = useUnwrapGasLimit();
  const unwrapTxCostInUsd = useTxCostInUsd(Number(unwrapGasLimit));
  const { willReceiveStETH } = useUnwrapFormData();

  return (
    <StatsDataTable>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={!unwrapTxCostInUsd}
      >
        <FormatPrice amount={unwrapTxCostInUsd} />
      </DataTableRow>
      <DataTableRowStethByWsteth />
      <DataTableRow title="You will receive">
        <FormatToken
          data-testid="youWillReceive"
          amount={willReceiveStETH}
          symbol="stETH"
        />
      </DataTableRow>
    </StatsDataTable>
  );
};
