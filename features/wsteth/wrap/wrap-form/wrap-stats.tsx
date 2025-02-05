import { useFormContext } from 'react-hook-form';

import { DataTable, DataTableRow } from '@lidofinance/lido-ui';

import { DATA_UNAVAILABLE } from 'consts/text';
import { ONE_stETH, useDappStatus, useWstethBySteth } from 'modules/web3';

import { useDebouncedWstethBySteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';

import { FormatPrice, FormatToken } from 'shared/formatters';
import { useTxCostInUsd } from 'shared/hooks/use-tx-cost-in-usd';

import { useApproveGasLimit } from '../hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

export const WrapFormStats = () => {
  const { isDappActive, chainId } = useDappStatus();
  const { allowance, isShowAllowance, wrapGasLimit, isAllowanceLoading } =
    useWrapFormData();

  const { watch } = useFormContext<WrapFormInputType>();
  const [token, amount] = watch(['token', 'amount']);

  const isSteth = token === TOKENS_TO_WRAP.stETH;

  const { data: willReceiveWsteth, isLoading: isWillReceiveWstethLoading } =
    useDebouncedWstethBySteth(amount);

  const { data: oneWstethConverted, isLoading: oneWstethConvertedLoading } =
    useWstethBySteth(ONE_stETH);

  // Using the chainId (chainId from the chain switcher) for TX calculation (and below for 'wrapTxCostInUsd'),
  // because the statistics here are shown for the chain from the chain switcher
  const approveGasLimit = useApproveGasLimit();
  const { txCostUsd: approveTxCostInUsd, isLoading: isApproveCostLoading } =
    useTxCostInUsd(approveGasLimit, chainId);

  const { txCostUsd: wrapTxCostInUsd, isLoading: isWrapCostLoading } =
    useTxCostInUsd(wrapGasLimit, chainId);

  return (
    <DataTable data-testid="wrapStats">
      <DataTableRow
        title="You will receive"
        loading={isWillReceiveWstethLoading}
      >
        <FormatToken
          amount={willReceiveWsteth}
          data-testid="youWillReceive"
          fallback="-"
          symbol="wstETH"
          trimEllipsis
        />
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
      <DataTableRow
        title="Max transaction cost"
        data-testid="maxGasFee"
        loading={isWrapCostLoading}
      >
        <FormatPrice amount={wrapTxCostInUsd} />
      </DataTableRow>
      <DataTableRow
        title="Exchange rate"
        data-testid="exchangeRate"
        loading={oneWstethConvertedLoading}
      >
        {oneWstethConverted ? (
          <>
            1 {isSteth ? 'stETH' : 'ETH'} ={' '}
            <FormatToken
              data-testid="rate"
              amount={oneWstethConverted}
              symbol="wstETH"
            />{' '}
          </>
        ) : (
          DATA_UNAVAILABLE
        )}
      </DataTableRow>
      {isShowAllowance && (
        <AllowanceDataTableRow
          data-testid="allowance"
          allowance={allowance}
          isBlank={!(isSteth && isDappActive)}
          loading={isAllowanceLoading}
          token={TOKENS_TO_WRAP.stETH}
        />
      )}
    </DataTable>
  );
};
