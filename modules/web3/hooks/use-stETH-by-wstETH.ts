import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useStETHByWstETH = (wsteth?: bigint | null) => {
  const { isL2, l2, shares, chainId } = useLidoSDK();

  return useQuery({
    queryKey: ['use-steth-by-wsteth', wsteth?.toString(), isL2, chainId],
    enabled: wsteth != null && !!(isL2 ? l2.steth : shares),
    staleTime: Infinity,
    queryFn: () => {
      if (wsteth == null) return undefined;

      return isL2
        ? l2.steth.convertToSteth(wsteth)
        : shares.convertToSteth(wsteth);
    },
  });
};
