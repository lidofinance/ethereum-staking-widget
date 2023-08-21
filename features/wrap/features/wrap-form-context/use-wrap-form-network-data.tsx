import { useCallback, useMemo } from 'react';
import {
  useWSTETHBalance,
  useSTETHBalance,
  useEthereumBalance,
} from '@lido-sdk/react';

import { useWrapGasLimit } from '../wrap-form/hooks/use-wrap-gas-limit';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useCurrencyMaxAmount } from 'shared/forms/hooks/useCurrencyMaxAmount';

import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { TOKENS_TO_WRAP } from 'features/wrap/types';
import { parseEther } from '@ethersproject/units';
import { useAwaiter } from 'shared/hooks/use-awaiter';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const [isMultisig, isLoadingMultisig] = useIsMultisig();
  const { data: ethBalance, update: ethBalanceUpdate } = useEthereumBalance(
    undefined,
    STRATEGY_LAZY,
  );
  const { data: stethBalance, update: stethBalanceUpdate } = useSTETHBalance();
  const { data: wstethBalance, update: wstethBalanceUpdate } =
    useWSTETHBalance();

  const { gasLimitETH, gasLimitStETH } = useWrapGasLimit();

  const maxAmountETH = useCurrencyMaxAmount({
    limit: ethBalance,
    token: TOKENS_TO_WRAP.ETH,
    padded: isMultisig,
    gasLimit: gasLimitETH,
  });

  const revalidateWrapFormData = useCallback(async () => {
    void ethBalanceUpdate();
    void stethBalanceUpdate();
    void wstethBalanceUpdate();
  }, [ethBalanceUpdate, stethBalanceUpdate, wstethBalanceUpdate]);

  const networkData = useMemo(
    () => ({
      isMultisig,
      ethBalance,
      stethBalance,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      maxAmountETH: parseEther(maxAmountETH),
      maxAmountStETH: stethBalance,
    }),
    [
      isMultisig,
      ethBalance,
      stethBalance,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      maxAmountETH,
    ],
  );

  const networkDataAwaited = useMemo(() => {
    if (
      isLoadingMultisig ||
      !networkData.stethBalance ||
      !networkData.wstethBalance ||
      !networkData.gasLimitETH ||
      !networkData.gasLimitStETH ||
      !networkData.maxAmountETH ||
      !networkData.maxAmountStETH
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
