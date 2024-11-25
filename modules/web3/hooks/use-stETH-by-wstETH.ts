import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useStETHByWstETH = (wsteth?: bigint | null) => {
  const { isL2, l2, wrap, chainId } = useLidoSDK();

  return useQuery({
    queryKey: ['use-steth-by-wsteth', wsteth?.toString(), isL2, chainId],
    enabled: wsteth != null && !!(isL2 ? l2.steth : wrap),
    staleTime: Infinity,
    queryFn: () => {
      return isL2
        ? l2.steth.convertToSteth(wsteth as bigint)
        : wrap.convertWstethToSteth(wsteth as bigint);
    },
  });
};
