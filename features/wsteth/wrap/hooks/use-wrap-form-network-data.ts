import { useCallback, useMemo } from 'react';

import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useStakingLimitInfo } from 'shared/hooks';

import { useWrapGasLimit } from './use-wrap-gas-limit';
import {
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useMaxGasPrice,
  useIsMultisig,
  BALANCE_PADDING,
} from 'modules/web3';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const { isMultisig, isLoading: isMultisigLoading } = useIsMultisig();
  const { data: ethBalance, refetch: ethBalanceUpdate } = useEthereumBalance();
  const { data: stethBalance, refetch: stethBalanceUpdate } = useStethBalance();
  const { data: wstethBalance, refetch: wstethBalanceUpdate } =
    useWstethBalance();

  const { data: stakeLimitInfo, refetch: stakeLimitInfoUpdate } =
    useStakingLimitInfo();

  const { gasLimitETH, gasLimitStETH } = useWrapGasLimit();
  const { maxGasPrice } = useMaxGasPrice();

  const maxAmountETH = useTokenMaxAmount({
    balance: ethBalance,
    limit: stakeLimitInfo?.currentStakeLimit,
    isPadded: !isMultisig,
    gasLimit: gasLimitETH,
    padding: BALANCE_PADDING,
    isLoading: isMultisigLoading,
  });

  const wrapEthGasCost = maxGasPrice ? maxGasPrice * gasLimitStETH : undefined;

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
