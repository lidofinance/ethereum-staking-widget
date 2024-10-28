import { DataTableRow } from '@lidofinance/lido-ui';
import { parseEther } from '@ethersproject/units';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatToken } from 'shared/formatters';
import { useStethByWsteth } from 'shared/hooks';
import { useStETHByWstETHOnL2 } from 'modules/web3';
import { useDappStatus } from 'modules/web3';

const OneWsteth = parseEther('1');

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
}: DataTableRowStethByWstethProps) => {
  const { isDappActiveOnL2 } = useDappStatus();
  const stethByWsteth = useStethByWsteth(
    !isDappActiveOnL2 ? OneWsteth : undefined,
  );
  const stETHByWstETHOnL2 = useStETHByWstETHOnL2(
    isDappActiveOnL2 ? OneWsteth : undefined,
  );

  // TODO: remove isDappActiveOnL2
  const { data, initialLoading } = isDappActiveOnL2
    ? stETHByWstETHOnL2
    : stethByWsteth;

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
