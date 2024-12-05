import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useDappStatus, useLidoSDK, useLidoSDKL2 } from 'modules/web3';

export const useStETHByWstETH = (wsteth?: bigint | null) => {
  const { chainId } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2, isL2 } = useLidoSDKL2();

  return useQuery({
    queryKey: ['use-steth-by-wsteth', wsteth?.toString(), isL2, chainId],
    enabled: wsteth != null && !!(isL2 ? l2.steth : wrap),
    staleTime: Infinity,
    queryFn: () => {
      if (wsteth === 0n) return 0n;
      invariant(wsteth);

      return isL2
        ? l2.steth.convertToSteth(wsteth)
        : wrap.convertWstethToSteth(wsteth);
    },
  });
};
