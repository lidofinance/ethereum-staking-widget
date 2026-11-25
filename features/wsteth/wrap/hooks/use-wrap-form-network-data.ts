import { useCallback, useMemo } from 'react';

import { useTokenMaxAmount } from 'shared/hooks/use-token-max-amount';
import { useStakingLimitInfo } from 'shared/hooks';

import { useWrapGasLimit } from './use-wrap-gas-limit';
import {
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useMaxTxCost,
  useIsSmartAccount,
  BALANCE_PADDING,
} from 'modules/web3';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const { isSmartAccount, isLoading: isSmartAccountLoading } =
    useIsSmartAccount();
  const { data: ethBalance, refetch: ethBalanceUpdate } = useEthereumBalance();
  const { data: stethBalance, refetch: stethBalanceUpdate } = useStethBalance();
  const { data: wstethBalance, refetch: wstethBalanceUpdate } =
    useWstethBalance();

  const { data: stakeLimitInfo, refetch: stakeLimitInfoUpdate } =
    useStakingLimitInfo();

  const { gasLimitETH, gasLimitStETH, txStETH } = useWrapGasLimit();

  const maxAmountETH = useTokenMaxAmount({
    balance: ethBalance,
    limit: stakeLimitInfo?.currentStakeLimit,
    isPadded: !isSmartAccount,
    gasLimit: gasLimitETH,
    padding: BALANCE_PADDING,
    isLoading: isSmartAccountLoading,
  });

  // ETH needed for the stETH wrap tx; on L2 the quote includes the L1 data fee
  const { maxTxCost: wrapEthGasCost } = useMaxTxCost({
    gasLimit: gasLimitStETH,
    tx: txStETH,
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
      isSmartAccount,
      ethBalance,
      stethBalance,
      wrapEthGasCost,
      stakeLimitInfo,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      txStETH,
      maxAmountETH,
    }),
    [
      isSmartAccount,
      wrapEthGasCost,
      ethBalance,
      stethBalance,
      stakeLimitInfo,
      wstethBalance,
      revalidateWrapFormData,
      gasLimitETH,
      gasLimitStETH,
      txStETH,
      maxAmountETH,
    ],
  );
};
