import { useCallback, useMemo } from 'react';
import {
  useStethBalance,
  useWstethBalance,
  useIsSmartAccount,
} from 'modules/web3';

export const useUnwrapFormNetworkData = () => {
  const { isSmartAccount } = useIsSmartAccount();
  const { data: stethBalance, refetch: stethBalanceUpdate } = useStethBalance();
  const { data: wstethBalance, refetch: wstethBalanceUpdate } =
    useWstethBalance();

  const revalidateUnwrapFormData = useCallback(async () => {
    await Promise.allSettled([stethBalanceUpdate(), wstethBalanceUpdate()]);
  }, [stethBalanceUpdate, wstethBalanceUpdate]);

  const networkData = useMemo(
    () => ({
      isSmartAccount,
      stethBalance,
      wstethBalance,
      revalidateUnwrapFormData,
      maxAmount: wstethBalance,
    }),
    [isSmartAccount, stethBalance, wstethBalance, revalidateUnwrapFormData],
  );

  return networkData;
};
