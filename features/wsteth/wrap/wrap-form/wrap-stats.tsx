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
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useWstETHByStETHOnL2 } from 'shared/hooks/use-wstETH-by-stETH-on-l2';

import { useApproveGasLimit } from '../hooks/use-approve-gas-limit';
import { useWrapFormData, WrapFormInputType } from '../wrap-form-context';

const oneSteth = parseEther('1');

export const WrapFormStats = () => {
  const { isDappActive, isDappActiveOnL2 } = useDappStatus();
  const { allowance, isShowAllowance, wrapGasLimit, isApprovalLoading } =
    useWrapFormData();

  const { watch } = useFormContext<WrapFormInputType>();
  const [token, amount] = watch(['token', 'amount']);

  const isSteth = token === TOKENS_TO_WRAP.STETH;

  const {
    data: willReceiveWsteth,
    initialLoading: isWillReceiveWstethLoading,
  } = useDebouncedWstethBySteth(amount, isDappActiveOnL2);

  const {
    data: oneWstethConvertedOnL1,
    initialLoading: isOneWstethConvertedLoadingOnL1,
  } = useWstethBySteth(oneSteth);

  const {
    data: oneWstethConvertedOnL2,
    initialLoading: isOneWstethConvertedLoadingOnL2,
  } = useWstETHByStETHOnL2(isDappActiveOnL2 ? oneSteth : undefined);

  const approveGasLimit = useApproveGasLimit();
  const {
    txCostUsd: approveTxCostInUsd,
    initialLoading: isApproveCostLoading,
  } = useTxCostInUsd(approveGasLimit);

  const { txCostUsd: wrapTxCostInUsd, initialLoading: isWrapCostLoading } =
    useTxCostInUsd(wrapGasLimit);

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
        loading={
          isOneWstethConvertedLoadingOnL1 || isOneWstethConvertedLoadingOnL2
        }
      >
        {oneWstethConvertedOnL1 || oneWstethConvertedOnL2 ? (
          <>
            1 {isSteth ? 'stETH' : 'ETH'} ={' '}
            <FormatToken
              data-testid="rate"
              amount={
                isDappActiveOnL2
                  ? oneWstethConvertedOnL2
                  : oneWstethConvertedOnL1
              }
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
