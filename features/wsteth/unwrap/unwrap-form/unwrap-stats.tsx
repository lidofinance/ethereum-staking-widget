import { useStethByWsteth, useTxCostInUsd } from 'shared/hooks';
import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import { useWatch } from 'react-hook-form';

import { DataTableRow, DataTable } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { FormatPrice } from 'shared/formatters';
import { Zero } from '@ethersproject/constants';
import type { RequestFormInputType } from 'features/withdrawals/request/request-form-context';

export const UnwrapStats = () => {
  const unwrapGasLimit = useUnwrapGasLimit();
  const unwrapTxCostInUsd = useTxCostInUsd(Number(unwrapGasLimit));

  const [amount] = useWatch<RequestFormInputType, ['amount']>({
    name: ['amount'],
  });

  const { data: willReceiveStETH, initialLoading } = useStethByWsteth(
    amount ?? Zero,
  );

  return (
    <DataTable>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={!unwrapTxCostInUsd}
      >
        <FormatPrice amount={unwrapTxCostInUsd} />
      </DataTableRow>
      <DataTableRowStethByWsteth />
      <DataTableRow title="You will receive" loading={initialLoading}>
        {!willReceiveStETH && '-'}
        {willReceiveStETH && (
          <FormatToken
            data-testid="youWillReceive"
            amount={willReceiveStETH}
            symbol="stETH"
            showAmountTip
            trimEllipsis
          />
        )}
      </DataTableRow>
    </DataTable>
  );
};
