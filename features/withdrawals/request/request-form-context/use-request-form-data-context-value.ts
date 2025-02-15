import { useCallback, useMemo } from 'react';

import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import {
  useUnfinalizedStETH,
  useTotalSupply,
} from 'features/withdrawals/hooks';
import {
  useStethBalance,
  useWstethBalance,
  useWstethBySteth,
} from 'modules/web3';

// Provides all data fetching for form to function
export const useRequestFormDataContextValue = () => {
  const { revalidate: revalidateClaimData } = useClaimData();

  const { data: stethTotalSupply, isLoading: isTotalSupplyLoading } =
    useTotalSupply();

  const {
    maxAmount: maxAmountPerRequestSteth,
    minAmount: minUnstakeSteth,
    isWithdrawalsStatusLoading: isMinMaxStethLoading,
  } = useWithdrawals();
  const {
    data: balanceSteth,
    refetch: stethUpdate,
    isLoading: isStethBalanceLoading,
  } = useStethBalance();
  const {
    data: balanceWSteth,
    refetch: wstethUpdate,
    isLoading: isWstethBalanceLoading,
  } = useWstethBalance();
  const {
    data: unfinalizedStETH,
    refetch: unfinalizedStETHUpdate,
    isLoading: isUnfinalizedStethLoading,
  } = useUnfinalizedStETH();

  const { data: maxAmountPerRequestWSteth, isLoading: isMaxWstethLoading } =
    useWstethBySteth(maxAmountPerRequestSteth);
  const { data: minUnstakeWSteth, isLoading: isMinWstethLoading } =
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
