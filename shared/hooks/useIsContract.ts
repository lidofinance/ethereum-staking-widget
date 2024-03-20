import { useEthereumSWR } from '@lido-sdk/react';
import { STRATEGY_IMMUTABLE } from 'consts/swr-strategies';

export const useIsContract = (
  account?: string | null,
): { isLoading: boolean; isContract: boolean } => {
  // eth_getCode returns hex string of bytecode at address
  // for accounts it's "0x"
  // for contract it's potentially very long hex (can't be safely&quickly parsed)
  const result = useEthereumSWR({
    shouldFetch: !!account,
    method: 'getCode',
    params: [account, 'latest'],
    config: STRATEGY_IMMUTABLE,
  });

  return {
    isLoading: result.initialLoading,
    isContract: result.data ? result.data !== '0x' : false,
  };
};
