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
  const {
    isWalletConnected,
    isDappActiveOnL2,
    isDappActiveAndNetworksMatched,
  } = useDappStatus();
  const stethByWsteth = useStethByWsteth(
    !isDappActiveOnL2 ? OneWsteth : undefined,
  );
  const stETHByWstETHOnL2 = useStETHByWstETHOnL2(
    isDappActiveOnL2 ? OneWsteth : undefined,
  );

  const { data, initialLoading } = isDappActiveOnL2
    ? stETHByWstETHOnL2
    : stethByWsteth;

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={initialLoading}
    >
      {isWalletConnected && !isDappActiveAndNetworksMatched ? (
        '-'
      ) : data ? (
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
