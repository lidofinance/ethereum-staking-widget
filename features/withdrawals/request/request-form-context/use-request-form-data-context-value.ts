import {
  useSTETHTotalSupply,
  useWSTETHContractRPC,
  useSTETHBalance,
  useWSTETHBalance,
  useContractSWR,
} from '@lido-sdk/react';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useUnfinalizedStETH } from 'features/withdrawals/hooks';
import { useCallback, useMemo } from 'react';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

// Provides all data fetching for form to function
export const useRequestFormDataContextValue = () => {
  const { update: withdrawalRequestsDataUpdate } = useClaimData();
  const stethTotalSupply = useSTETHTotalSupply().data;
  const { maxAmount: maxAmountPerRequestSteth, minAmount: minUnstakeSteth } =
    useWithdrawals();
  const wstethContract = useWSTETHContractRPC();
  const { data: balanceSteth, update: stethUpdate } = useSTETHBalance();
  const { data: balanceWSteth, update: wstethUpdate } = useWSTETHBalance();
  const { data: unfinalizedStETH, update: unfinalizedStETHUpdate } =
    useUnfinalizedStETH();

  const maxAmountPerRequestWSteth = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [maxAmountPerRequestSteth],
    shouldFetch: !!maxAmountPerRequestSteth,
    config: STRATEGY_LAZY,
  }).data;
  const minUnstakeWSteth = useContractSWR({
    contract: wstethContract,
    method: 'getWstETHByStETH',
    params: [minUnstakeSteth],
    shouldFetch: !!minUnstakeSteth,
    config: STRATEGY_LAZY,
  }).data;

  const onSuccessRequest = useCallback(() => {
    return Promise.all([
      stethUpdate(),
      wstethUpdate(),
      withdrawalRequestsDataUpdate(),
      unfinalizedStETHUpdate(),
    ]);
  }, [
    stethUpdate,
    unfinalizedStETHUpdate,
    withdrawalRequestsDataUpdate,
    wstethUpdate,
  ]);

  return useMemo(
    () => ({
      maxAmountPerRequestSteth,
      minUnstakeSteth,
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestWSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      onSuccessRequest,
    }),
    [
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestSteth,
      maxAmountPerRequestWSteth,
      minUnstakeSteth,
      minUnstakeWSteth,
      stethTotalSupply,
      unfinalizedStETH,
      onSuccessRequest,
    ],
  );
};
