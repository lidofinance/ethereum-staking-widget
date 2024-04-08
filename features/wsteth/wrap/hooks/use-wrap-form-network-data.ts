import { useCallback, useMemo } from 'react';
import {
  useWSTETHBalance,
  useSTETHBalance,
  useEthereumBalance,
} from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useMaxGasPrice, useStakingLimitInfo } from 'shared/hooks';

import { useWrapGasLimit } from './use-wrap-gas-limit';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const { data: ethBalance, update: ethBalanceUpdate } = useEthereumBalance(
    undefined,
    STRATEGY_LAZY,
  );
  const { data: stethBalance, update: stethBalanceUpdate } =
    useSTETHBalance(STRATEGY_LAZY);
  const { data: wstethBalance, update: wstethBalanceUpdate } =
    useWSTETHBalance(STRATEGY_LAZY);

  const { data: stakeLimitInfo, mutate: stakeLimitInfoUpdate } =
    useStakingLimitInfo();

  const { gasLimitETH, gasLimitStETH } = useWrapGasLimit();
  const { maxGasPrice } = useMaxGasPrice();

  const maxAmountETH = useTokenMaxAmount({
    balance: ethBalance,
    limit: stakeLimitInfo?.currentStakeLimit,
    isPadded: !isMultisig,
    gasLimit: gasLimitETH,
    padding: config.BALANCE_PADDING,
    isLoading: isMultisigLoading,
  });

  const wrapEthGasCost = maxGasPrice
    ? maxGasPrice.mul(gasLimitStETH)
    : undefined;

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
      wrapEthGasCost,
      stakeLimitInfo,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      maxAmountETH,
    }),
    [
      isMultisig,
      wrapEthGasCost,
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
