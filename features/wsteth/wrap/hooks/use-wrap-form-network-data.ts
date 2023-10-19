import { useCallback, useMemo } from 'react';
import {
  useWSTETHBalance,
  useSTETHBalance,
  useEthereumBalance,
} from '@lido-sdk/react';
import { useWrapGasLimit } from './use-wrap-gas-limit';
import { useIsMultisig } from 'shared/hooks/useIsMultisig';
import { useCurrencyMaxAmount } from 'shared/hooks/useCurrencyMaxAmount';

import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { parseEther } from '@ethersproject/units';

// Provides all data fetching for form to function
export const useWrapFormNetworkData = () => {
  const { isMultisig } = useIsMultisig();
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
    padded: !isMultisig,
    gasLimit: gasLimitETH,
  });

  const revalidateWrapFormData = useCallback(async () => {
    await Promise.allSettled([
      ethBalanceUpdate(),
      stethBalanceUpdate(),
      wstethBalanceUpdate(),
    ]);
  }, [ethBalanceUpdate, stethBalanceUpdate, wstethBalanceUpdate]);

  return useMemo(
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
};
