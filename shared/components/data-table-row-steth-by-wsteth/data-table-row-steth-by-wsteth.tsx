import { DataTableRow } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { FormatToken } from 'shared/formatters';
import {
  ONE_stETH,
  ONE_wstETH,
  useStETHByWstETH,
  useWstethBySteth,
} from 'modules/web3';

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
  providerChainId?: number;
};

type DataTableRowWstethByStethProps = {
  fromSymbol?: string;
  providerChainId?: number;
};

export const DataTableRowWstethBySteth = ({
  fromSymbol = 'ETH',
  providerChainId,
}: DataTableRowWstethByStethProps) => {
  const { data: wstethBySteth, isLoading } = useWstethBySteth(
    ONE_stETH,
    providerChainId,
  );

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={isLoading}
    >
      {wstethBySteth ? (
        <>
          1 {fromSymbol} =
          <FormatToken
            data-testid="destinationRate"
            amount={wstethBySteth}
            symbol={'wstETH'}
          />
        </>
      ) : (
        DATA_UNAVAILABLE
      )}
    </DataTableRow>
  );
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
  providerChainId,
}: DataTableRowStethByWstethProps) => {
  const { data: stethByWsteth, isLoading } = useStETHByWstETH(
    ONE_wstETH,
    providerChainId,
  );

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={isLoading}
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
