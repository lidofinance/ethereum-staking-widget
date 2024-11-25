import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useWstethBySteth = (steth?: bigint | null) => {
  const { isL2, l2, wrap, chainId } = useLidoSDK();

  return useQuery({
    queryKey: ['use-wsteth-by-steth', steth?.toString(), isL2, chainId],
    enabled: steth != null && !!(isL2 ? l2.wsteth : wrap),
    staleTime: Infinity,
    queryFn: () => {
      return isL2
        ? l2.steth.convertToShares(steth as bigint)
        : wrap.convertStethToWsteth(steth as bigint);
    },
  });
};
