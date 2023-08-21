import { BigNumber } from 'ethers';

import { useTxCostInUsd } from 'shared/hooks';
import { useUnwrapGasLimit } from './hooks';

import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters/format-token';
import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';

type UnwrapStatsProps = {
  willReceiveStethAsBigNumber?: BigNumber;
};

export const UnwrapStats = ({
  willReceiveStethAsBigNumber,
}: UnwrapStatsProps) => {
  const unwrapGasLimit = useUnwrapGasLimit();
  const unwrapTxCostInUsd = useTxCostInUsd(unwrapGasLimit);

  return (
    <DataTable>
      <DataTableRow
        title="Max gas fee"
        data-testid="maxGasFee"
        loading={!unwrapTxCostInUsd}
      >
        ${unwrapTxCostInUsd?.toFixed(2)}
      </DataTableRow>
      <DataTableRowStethByWsteth />
      <DataTableRow title="You will receive">
        <FormatToken
          data-testid="youWillReceive"
          amount={willReceiveStethAsBigNumber}
          symbol="stETH"
        />
      </DataTableRow>
    </DataTable>
  );
};
