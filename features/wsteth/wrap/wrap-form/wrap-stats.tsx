import { parseEther } from '@ethersproject/units';
import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { useFormContext } from 'react-hook-form';

import { FormatPrice, FormatToken } from 'shared/formatters';
import { useTxCostInUsd, useWstethBySteth } from 'shared/hooks';

import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

import { useApproveGasLimit } from '../hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';
import { useWeb3 } from 'reef-knot/web3-react';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';
import { TOKENS } from '@lido-sdk/constants';

const oneSteth = parseEther('1');

export const WrapFormStats = () => {
  const { active } = useWeb3();
  const { allowance, wrapGasLimit, willReceiveWsteth, isApprovalLoading } =
    useWrapFormData();

  const { watch } = useFormContext<WrapFormInputType>();
  const [token] = watch(['token']);

  const isSteth = token === TOKENS_TO_WRAP.STETH;

  const oneWstethConverted = useWstethBySteth(oneSteth);

  const approveGasLimit = useApproveGasLimit();
  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);

  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);

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
      <AllowanceDataTableRow
        data-testid="allowance"
        allowance={allowance}
        isBlank={!(isSteth && active)}
        loading={isApprovalLoading}
        token={TOKENS.STETH}
      />

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
