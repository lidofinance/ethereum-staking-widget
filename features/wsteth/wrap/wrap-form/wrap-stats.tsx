import { useFormContext } from 'react-hook-form';

import { parseEther } from '@ethersproject/units';
import { DataTable, DataTableRow } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { DATA_UNAVAILABLE } from 'consts/text';
import { useDebouncedWstethBySteth } from 'features/wsteth/shared/hooks/use-debounced-wsteth-steth';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { AllowanceDataTableRow } from 'shared/components/allowance-data-table-row';
import { FormatPrice, FormatToken } from 'shared/formatters';
import { useTxCostInUsd, useWstethBySteth } from 'shared/hooks';
import { useDappStatus, useWstETHByStETHOnL2 } from 'modules/web3';

import { useApproveGasLimit } from '../hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

const oneSteth = parseEther('1');

export const WrapFormStats = () => {
  const { isDappActive, isDappActiveOnL2, chainTypeChainId } = useDappStatus();
  const { allowance, isShowAllowance, wrapGasLimit, isApprovalLoading } =
    useWrapFormData();

  const { watch } = useFormContext<WrapFormInputType>();
  const [token, amount] = watch(['token', 'amount']);

  const isSteth = token === TOKENS_TO_WRAP.STETH;

  const {
    data: willReceiveWsteth,
    initialLoading: isWillReceiveWstethLoading,
  } = useDebouncedWstethBySteth(amount, isDappActiveOnL2);

  const wstethBySteth = useWstethBySteth(
    !isDappActiveOnL2 ? oneSteth : undefined,
  );
  const wstETHByStETHOnL2 = useWstETHByStETHOnL2(
    isDappActiveOnL2 ? oneSteth : undefined,
  );

  const {
    data: oneWstethConverted,
    initialLoading: oneWstethConvertedLoading,
  } = isDappActiveOnL2 ? wstETHByStETHOnL2 : wstethBySteth;

  // The 'approveGasLimit' difference between the networks is insignificant
  // and can be neglected in the '!isChainTypeMatched' case
  //
  // Using the chainTypeChainId (chainId from the chain switcher) for TX calculation (and below for 'wrapTxCostInUsd'),
  // because the statistics here are shown for the chain from the chain switcher
  const approveGasLimit = useApproveGasLimit();
  const {
    txCostUsd: approveTxCostInUsd,
    initialLoading: isApproveCostLoading,
  } = useTxCostInUsd(approveGasLimit, chainTypeChainId);

  // The 'wrapGasLimit' difference between the networks is insignificant
  // and can be neglected in the '!isChainTypeMatched' case
  const { txCostUsd: wrapTxCostInUsd, initialLoading: isWrapCostLoading } =
    useTxCostInUsd(wrapGasLimit, chainTypeChainId);

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
          loading={isApprovalLoading}
          token={TOKENS.STETH}
        />
      )}
    </DataTable>
  );
};
