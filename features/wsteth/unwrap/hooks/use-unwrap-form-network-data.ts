import { useCallback, useMemo } from 'react';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useSTETHBalance, useWSTETHBalance } from '@lido-sdk/react';

export const useUnwrapFormNetworkData = () => {
  const [isMultisig] = useIsMultisig();
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

  return networkData;
};
