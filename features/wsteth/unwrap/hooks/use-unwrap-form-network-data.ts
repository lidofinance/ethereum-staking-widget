import { useCallback, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useSTETHBalance, useWSTETHBalance } from '@lido-sdk/react';

export const useUnwrapFormNetworkData = () => {
  const [isMultisig, isLoadingMultisig] = useIsMultisig();
  const { data: stethBalance, update: stethBalanceUpdate } = useSTETHBalance();
  const { data: wstethBalance, update: wstethBalanceUpdate } =
    useWSTETHBalance();

  const revalidateUnwrapFormData = useCallback(async () => {
    await Promise.allSettled([stethBalanceUpdate(), wstethBalanceUpdate()]);
  }, [stethBalanceUpdate, wstethBalanceUpdate]);

  const networkData = useMemo(
    () => ({
      isMultisig,
      stethBalance,
      wstethBalance,
      revalidateUnwrapFormData,
      maxAmount: wstethBalance,
    }),
    [isMultisig, stethBalance, wstethBalance, revalidateUnwrapFormData],
  );

  const networkDataAwaited = useMemo(() => {
    if (
      isLoadingMultisig ||
      !networkData.stethBalance ||
      !networkData.wstethBalance
    ) {
      return undefined;
    }
    return networkData;
  }, [isLoadingMultisig, networkData]);

  const networkDataAwaiter = useAwaiter(networkDataAwaited);

  return {
    networkData,
    networkDataPromise: networkDataAwaiter.awaiter,
  };
};
