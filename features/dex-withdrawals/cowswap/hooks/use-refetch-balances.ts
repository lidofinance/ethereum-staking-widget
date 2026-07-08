import {
  useStethBalance,
  useWstethBalance,
  useEthereumBalance,
} from 'modules/web3';
import { useCallback } from 'react';

export const useRefetchBalances = () => {
  const { refetch: refetchSteth } = useStethBalance();
  const { refetch: refetchWsteth } = useWstethBalance();
  const { refetch: refetchEth } = useEthereumBalance();

  return useCallback(() => {
    const options = { cancelRefetch: true, throwOnError: false };
    return Promise.all([
      refetchSteth(options),
      refetchWsteth(options),
      refetchEth(options),
    ]);
  }, [refetchEth, refetchSteth, refetchWsteth]);
};
