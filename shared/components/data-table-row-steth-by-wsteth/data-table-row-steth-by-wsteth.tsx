import { DataTableRow } from '@lidofinance/lido-ui';
import { parseEther } from '@ethersproject/units';

import { FormatToken } from 'shared/formatters';
import { useStethByWsteth } from 'shared/hooks';

import { DATA_UNAVAILABLE } from 'consts/text';

const OneWsteth = parseEther('1');

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
}: DataTableRowStethByWstethProps) => {
  const { data, initialLoading } = useStethByWsteth(OneWsteth);

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={initialLoading}
    >
      {data ? (
        <>
          1 wstETH =
          <FormatToken
            data-testid="destinationRate"
            amount={data}
            symbol={toSymbol}
          />
        </>
      ) : (
        DATA_UNAVAILABLE
      )}
    </DataTableRow>
  );
};
