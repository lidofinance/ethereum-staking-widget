import { useSTETHContractRPC, useContractSWR } from '@lido-sdk/react';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';
import { useUnfinalizedStETH } from 'features/withdrawals/hooks';
import { useCallback, useMemo } from 'react';
import { useWstethBySteth } from 'shared/hooks';
import { useStethBalance, useWstethBalance } from 'modules/web3';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

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
      maxAmountPerRequestSteth: maxAmountPerRequestSteth,
      minUnstakeSteth: minUnstakeSteth,
      balanceSteth,
      balanceWSteth,
      maxAmountPerRequestWSteth: maxAmountPerRequestWSteth,
      minUnstakeWSteth: minUnstakeWSteth,
      stethTotalSupply: stethTotalSupply,
      unfinalizedStETH: unfinalizedStETH,
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
