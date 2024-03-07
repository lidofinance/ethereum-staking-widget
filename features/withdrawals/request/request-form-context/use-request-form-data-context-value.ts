import {
  useSTETHContractRPC,
  useSTETHBalance,
  useWSTETHBalance,
  useContractSWR,
} from '@lido-sdk/react';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useUnfinalizedStETH } from 'features/withdrawals/hooks';
import { useCallback, useMemo } from 'react';
import { useWstethBySteth } from 'shared/hooks';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

// Provides all data fetching for form to function
export const useRequestFormDataContextValue = () => {
  const { revalidate: revalidateClaimData } = useClaimData();
  // useTotalSupply is bugged and switches to undefined for 1 render
  const { data: stethTotalSupply, initialLoading: isTotalSupplyLoading } =
    useContractSWR({
      contract: useSTETHContractRPC(),
      method: 'totalSupply',
      config: STRATEGY_LAZY,
    });
  const {
    maxAmount: maxAmountPerRequestSteth,
    minAmount: minUnstakeSteth,
    isWithdrawalsStatusLoading: isMinMaxStethLoading,
  } = useWithdrawals();
  const {
    data: balanceSteth,
    update: stethUpdate,
    initialLoading: isStethBalanceLoading,
  } = useSTETHBalance(STRATEGY_LAZY);
  const {
    data: balanceWSteth,
    update: wstethUpdate,
    initialLoading: isWstethBalanceLoading,
  } = useWSTETHBalance(STRATEGY_LAZY);
  const {
    data: unfinalizedStETH,
    update: unfinalizedStETHUpdate,
    initialLoading: isUnfinalizedStethLoading,
  } = useUnfinalizedStETH();

  const {
    data: maxAmountPerRequestWSteth,
    initialLoading: isMaxWstethLoading,
  } = useWstethBySteth(maxAmountPerRequestSteth);
  const { data: minUnstakeWSteth, initialLoading: isMinWstethLoading } =
    useWstethBySteth(minUnstakeSteth);

  const loading = useMemo(
    () => ({
      isMinWstethLoading,
      isMaxWstethLoading,
      isUnfinalizedStethLoading,
      isWstethBalanceLoading,
      isStethBalanceLoading,
      isMinMaxStethLoading,
      isTotalSupplyLoading,
    }),
    [
      isMaxWstethLoading,
      isMinMaxStethLoading,
      isMinWstethLoading,
      isStethBalanceLoading,
      isTotalSupplyLoading,
      isUnfinalizedStethLoading,
      isWstethBalanceLoading,
    ],
  );

  const revalidateRequestFormData = useCallback(async () => {
    await Promise.allSettled([
      stethUpdate(),
      wstethUpdate(),
      revalidateClaimData(),
      unfinalizedStETHUpdate(),
    ]);
  }, [stethUpdate, unfinalizedStETHUpdate, revalidateClaimData, wstethUpdate]);

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
      revalidateRequestFormData,
      loading,
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
      revalidateRequestFormData,
      loading,
    ],
  );
};
