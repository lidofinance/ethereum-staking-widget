import { useCallback, useMemo } from 'react';
import {
  useWSTETHBalance,
  useSTETHBalance,
  useEthereumBalance,
} from '@lido-sdk/react';
import { useWrapGasLimit } from './use-wrap-gas-limit';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';

import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { useStakingLimitInfo } from 'shared/hooks';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const { data: ethBalance, update: ethBalanceUpdate } = useEthereumBalance(
    undefined,
    STRATEGY_LAZY,
  );
  const { data: stethBalance, update: stethBalanceUpdate } = useSTETHBalance();
  const { data: wstethBalance, update: wstethBalanceUpdate } =
    useWSTETHBalance();

  const { data: stakeLimitInfo, mutate: stakeLimitInfoUpdate } =
    useStakingLimitInfo();

  const { gasLimitETH, gasLimitStETH } = useWrapGasLimit();

  const maxAmountETH = useTokenMaxAmount({
    balance: ethBalance,
    limit: stakeLimitInfo?.currentStakeLimit,
    isPadded: !isMultisig,
    gasLimit: gasLimitETH,
    isLoading: !isMultisigLoading,
  });

  const revalidateWrapFormData = useCallback(async () => {
    await Promise.allSettled([
      ethBalanceUpdate(),
      stethBalanceUpdate(),
      wstethBalanceUpdate(),
      stakeLimitInfoUpdate(),
    ]);
  }, [
    ethBalanceUpdate,
    stethBalanceUpdate,
    wstethBalanceUpdate,
    stakeLimitInfoUpdate,
  ]);

  return useMemo(
    () => ({
      isMultisig,
      ethBalance,
      stethBalance,
      stakeLimitInfo,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      maxAmountETH,
      maxAmountStETH: stethBalance,
    }),
    [
      isMultisig,
      ethBalance,
      stethBalance,
      stakeLimitInfo,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      maxAmountETH,
    ],
  );
};
