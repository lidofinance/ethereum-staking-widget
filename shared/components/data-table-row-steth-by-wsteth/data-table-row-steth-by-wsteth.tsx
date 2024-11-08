import { DataTableRow } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatToken } from 'shared/formatters';
import { useStETHByWstETH, ONE_wstETH } from 'modules/web3';

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
}: DataTableRowStethByWstethProps) => {
  const { data: stethByWsteth, initialLoading } = useStETHByWstETH(ONE_wstETH);

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={initialLoading}
    >
      {stethByWsteth ? (
        <>
          1 wstETH =
          <FormatToken
            data-testid="destinationRate"
            amount={stethByWsteth}
            symbol={toSymbol}
          />
        </>
      ) : (
        DATA_UNAVAILABLE
      )}
    </DataTableRow>
  );
};
