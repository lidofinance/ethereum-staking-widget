import { useMemo } from 'react';
import { parseEther } from '@ethersproject/units';

import { useFormContext } from 'react-hook-form';
import { useTxCostInUsd, useWstethBySteth } from 'shared/hooks';
import { useApproveGasLimit } from './hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';
import { TOKENS_TO_WRAP } from 'features/wrap/types';

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
    <DataTable>
      <DataTableRow
        title="Max unlock fee"
        data-testid="maxUnlockFee"
        loading={!approveTxCostInUsd}
      >
        ${approveTxCostInUsd?.toFixed(2)}
      </DataTableRow>
      <DataTableRow
        title="Max gas fee"
        data-testid="maxGasFee"
        loading={!wrapTxCostInUsd}
      >
        ${wrapTxCostInUsd?.toFixed(2)}
      </DataTableRow>
      <DataTableRow
        title="Exchange rate"
        data-testid="exchangeRate"
        loading={!oneWstethConverted}
      >
        1 {isSteth ? 'stETH' : 'ETH'} ={' '}
        <FormatToken amount={oneWstethConverted} symbol="wstETH" />
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
        />
      </DataTableRow>
    </DataTable>
  );
};
