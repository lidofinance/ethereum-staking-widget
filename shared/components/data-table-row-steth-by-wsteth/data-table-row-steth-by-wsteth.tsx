import { useMemo } from 'react';
import { useStethByWsteth } from 'shared/hooks';

import { DataTableRow } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';

import { parseEther } from '@ethersproject/units';

export const useWstethToStethRatio = () => {
  const oneWstethAsBigNumber = useMemo(() => parseEther('1'), []);
  const wstethAsStethBN = useStethByWsteth(oneWstethAsBigNumber);

  return { wstethAsStethBN, loading: !wstethAsStethBN };
};

type DataTableRowStethByWstethProps = {
  toSymbol?: string;
};

export const DataTableRowStethByWsteth = ({
  toSymbol = 'stETH',
}: DataTableRowStethByWstethProps) => {
  const { loading, wstethAsStethBN } = useWstethToStethRatio();

  return (
    <DataTableRow
      data-testid="exchangeRate"
      title="Exchange rate"
      loading={loading}
    >
      <span data-testid="selectedToken">1 wstETH </span>={' '}
      <FormatToken
        data-testid="destinationToken"
        amount={wstethAsStethBN}
        symbol={toSymbol}
      />
    </DataTableRow>
  );
};
