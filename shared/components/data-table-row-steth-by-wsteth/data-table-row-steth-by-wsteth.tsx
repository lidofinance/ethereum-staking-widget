import { DataTableRow } from '@lidofinance/lido-ui';
import { parseEther } from '@ethersproject/units';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatToken } from 'shared/formatters';
import { useStethByWsteth } from 'shared/hooks';
import { useStETHByWstETHOnL2 } from 'shared/hooks/use-stETH-by-wstETH-on-l2';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

const OneWsteth = parseEther('1');

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
}: DataTableRowStethByWstethProps) => {
  const { isDappActiveOnL2 } = useDappStatus();
  const { data: dataOnL1, initialLoading: initialLoadingOnL1 } =
    useStethByWsteth(OneWsteth);
  const { data: dataOnL2, initialLoading: initialLoadingOnL2 } =
    useStETHByWstETHOnL2(isDappActiveOnL2 ? OneWsteth : undefined);

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={isDappActiveOnL2 ? initialLoadingOnL2 : initialLoadingOnL1}
    >
      {dataOnL1 || dataOnL2 ? (
        <>
          1 wstETH =
          <FormatToken
            data-testid="destinationRate"
            amount={isDappActiveOnL2 ? dataOnL2 : dataOnL1}
            symbol={toSymbol}
          />
        </>
      ) : (
        DATA_UNAVAILABLE
      )}
    </DataTableRow>
  );
};
