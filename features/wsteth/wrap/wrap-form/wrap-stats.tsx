import { useMemo } from 'react';
import { parseEther } from '@ethersproject/units';
import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useFormContext } from 'react-hook-form';

import { FormatPrice, FormatToken } from 'shared/formatters';
import { useTxCostInUsd, useWstethBySteth } from 'shared/hooks';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

import { useApproveGasLimit } from '../hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

export const WrapFormStats = () => {
  const { allowance, wrapGasLimit, willReceiveWsteth, isApprovalLoading } =
    useWrapFormData();

  const { watch } = useFormContext<WrapFormInputType>();
  const [token] = watch(['token']);
  const isSteth = token === TOKENS_TO_WRAP.STETH;

  const oneSteth = useMemo(() => parseEther('1'), []);
  const oneWstethConverted = useWstethBySteth(oneSteth);

  const approveGasLimit = useApproveGasLimit();
  const approveTxCostInUsd = useTxCostInUsd(Number(approveGasLimit));

  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit && Number(wrapGasLimit));

  return (
    <DataTable data-testid="wrapStats">
      <DataTableRow
        title="Max unlock cost"
        data-testid="maxUnlockFee"
        loading={!approveTxCostInUsd}
      >
        <FormatPrice amount={approveTxCostInUsd} />
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={!wrapTxCostInUsd}
      >
        <FormatPrice amount={wrapTxCostInUsd} />
      </DataTableRow>
      <DataTableRow
        title="Exchange rate"
        data-testid="exchangeRate"
        loading={!oneWstethConverted}
      >
        1 {isSteth ? 'stETH' : 'ETH'} ={' '}
        <FormatToken
          data-testid="rate"
          amount={oneWstethConverted}
          symbol="wstETH"
        />
      </DataTableRow>
      <DataTableRow
        data-testid="allowance"
        title="Allowance"
        loading={isApprovalLoading}
      >
        {isSteth ? <FormatToken amount={allowance} symbol="stETH" /> : <>-</>}
      </DataTableRow>
      <DataTableRow title="You will receive">
        <FormatToken
          amount={willReceiveWsteth}
          data-testid="youWillReceive"
          symbol="wstETH"
          showAmountTip
          trimEllipsis
        />
      </DataTableRow>
    </DataTable>
  );
};
