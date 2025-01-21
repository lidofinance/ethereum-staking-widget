import { useWatch } from 'react-hook-form';
import { DataTableRow, DataTable } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';

import { useDebouncedStethByWsteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';
import { useApproveGasLimit } from 'features/wsteth/wrap/hooks/use-approve-gas-limit';

import { DataTableRowStethByWsteth } from 'shared/components/data-table-row-steth-by-wsteth';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';
import { FormatToken } from 'shared/formatters/format-token';
import { FormatPrice } from 'shared/formatters';
import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';

import { useUnwrapGasLimit } from '../hooks/use-unwrap-gas-limit';
import { useUnwrapFormData, UnwrapFormInputType } from '../unwrap-form-context';
import { TOKENS_TO_WRAP } from '../../shared/types';

export const UnwrapStats = () => {
  const { isDappActiveOnL2, chainTypeChainId } = useDappStatus();
  const { allowance, isAllowanceLoading, isShowAllowance } =
    useUnwrapFormData();
  const amount = useWatch<UnwrapFormInputType, 'amount'>({ name: 'amount' });

  const unwrapGasLimit = useUnwrapGasLimit();
  // The 'unwrapGasLimit' difference between the networks is insignificant
  // and can be neglected in the '!isChainTypeMatched' case
  //
  // Using the chainTypeChainId (chainId from the chain switcher) for TX calculation (and below for 'approveTxCostInUsd'),
  // because the statistics here are shown for the chain from the chain switcher
  const { txCostUsd: unwrapTxCostInUsd, isLoading: isUnwrapTxCostLoading } =
    useTxCostInUsd(unwrapGasLimit, chainTypeChainId);

  const approveGasLimit = useApproveGasLimit();
  // The 'approveGasLimit' difference between the networks is insignificant
  // and can be neglected in the '!isChainTypeMatched' case
  const { txCostUsd: approveTxCostInUsd, isLoading: isApproveCostLoading } =
    useTxCostInUsd(approveGasLimit, chainTypeChainId);

  const { data: willReceiveStETH, isLoading: isWillReceiveStETHLoading } =
    useDebouncedStethByWsteth(amount);

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
        <FormatPrice amount={unwrapTxCostInUsd} />
      </DataTableRow>
      {isShowAllowance && (
        <DataTableRow
          title="Max unlock cost"
          data-testid="maxUnlockFee"
          loading={isApproveCostLoading}
        >
          <FormatPrice amount={approveTxCostInUsd} />
        </DataTableRow>
      )}
      <DataTableRowStethByWsteth />
      {isShowAllowance && (
        <AllowanceDataTableRow
          data-testid="allowance"
          allowance={allowance}
          isBlank={!isDappActiveOnL2}
          loading={isAllowanceLoading}
          token={TOKENS_TO_WRAP.wstETH}
        />
      )}
    </DataTable>
  );
};
