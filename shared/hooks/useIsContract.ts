import { useEthereumSWR } from '@lido-sdk/react';

export const useIsContract = (
  account?: string | null,
): { loading: boolean; isContract: boolean } => {
  // eth_getCode returns hex string of bytecode at address
  // for accounts it's "0x"
  // for contract it's potentially very long hex (can't be safely&quickly parsed)
  const result = useEthereumSWR({
    shouldFetch: !!account,
    method: 'getCode',
    params: [account, 'latest'],
    config: {
      // this is very stable request
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    },
  });

  return {
    loading: result.loading,
    isContract: result.data ? result.data !== '0x' : false,
  };
};
