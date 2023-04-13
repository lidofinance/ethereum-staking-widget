import { useMemo } from 'react';
import { useStethByWsteth } from 'shared/hooks';

import { DataTableRow } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';

import { parseEther } from '@ethersproject/units';

export const DataTableRowStethByWsteth = () => {
  const oneWstethAsBigNumber = useMemo(() => parseEther('1'), []);
  const oneWstethConvertedToStethAsBigNumber =
    useStethByWsteth(oneWstethAsBigNumber);

  return (
    <DataTableRow
      title="Exchange rate"
      loading={!oneWstethConvertedToStethAsBigNumber}
    >
      1 wstETH =
      <FormatToken
        amount={oneWstethConvertedToStethAsBigNumber}
        symbol="stETH"
      />
    </DataTableRow>
  );
};
