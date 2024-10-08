import { useWatch } from 'react-hook-form';
import { BigNumber } from 'ethers';
import { DataTableRow, DataTable } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';
import { FormatToken } from 'shared/formatters/format-token';
import { FormatPrice } from 'shared/formatters';
import { useTxCostInUsd } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { useDebouncedStethByWsteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';
import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import { useUnwrapFormData, UnwrapFormInputType } from '../unwrap-form-context';
import { useApproveGasLimit } from 'features/wsteth/wrap/hooks/use-approve-gas-limit';

export const UnwrapStats = () => {
  const {
    isWalletConnected,
    isAccountActiveOnL2,
    isDappActiveAndNetworksMatched,
  } = useDappStatus();
  const { allowance, isAllowanceLoading, isShowAllowance } =
    useUnwrapFormData();
  const amount = useWatch<UnwrapFormInputType, 'amount'>({ name: 'amount' });
  const unwrapGasLimit = useUnwrapGasLimit();
  const {
    txCostUsd: unwrapTxCostInUsd,
    initialLoading: isUnwrapTxCostLoading,
  } = useTxCostInUsd(unwrapGasLimit);

  const approveGasLimit = useApproveGasLimit();
  const {
    txCostUsd: approveTxCostInUsd,
    initialLoading: isApproveCostLoading,
  } = useTxCostInUsd(approveGasLimit);

  const { data: willReceiveStETH, initialLoading: isWillReceiveStETHLoading } =
    useDebouncedStethByWsteth(amount, isAccountActiveOnL2);

  return (
    <DataTable>
      <DataTableRow
        title="You will receive"
        loading={isWillReceiveStETHLoading}
      >
        <FormatToken
          data-testid="youWillReceive"
          fallback="-"
          amount={willReceiveStETH}
          symbol="stETH"
          trimEllipsis
        />
      </DataTableRow>
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={isUnwrapTxCostLoading}
      >
        {isWalletConnected && !isDappActiveAndNetworksMatched ? (
          '-'
        ) : (
          <FormatPrice amount={unwrapTxCostInUsd} />
        )}
      </DataTableRow>
      {isShowAllowance && (
        <DataTableRow
          title="Max unlock cost"
          data-testid="maxUnlockFee"
          loading={isApproveCostLoading}
        >
          {isWalletConnected && !isDappActiveAndNetworksMatched ? (
            '-'
          ) : (
            <FormatPrice amount={approveTxCostInUsd} />
          )}
        </DataTableRow>
      )}
      <DataTableRowStethByWsteth />
      {isShowAllowance && (
        <AllowanceDataTableRow
          data-testid="allowance"
          allowance={BigNumber.from(allowance || '0')}
          loading={isAllowanceLoading}
          token={TOKENS.WSTETH}
        />
      )}
    </DataTable>
  );
};
