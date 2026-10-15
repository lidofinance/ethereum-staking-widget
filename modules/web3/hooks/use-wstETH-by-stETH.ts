import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useLidoSDK, useLidoSDKL2 } from 'modules/web3';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

export const useWstethBySteth = (steth?: bigint | null) => {
  const { wrap } = useLidoSDK();
  const { l2, isL2, chainId } = useLidoSDKL2();

  return useQuery({
    queryKey: ['use-wsteth-by-steth', { steth, chainId }],
    enabled: steth != null,
    ...STRATEGY_CONSTANT,
    queryFn: () => {
      if (steth === 0n) return 0n;
      invariant(steth);

      return isL2
        ? l2.steth.convertToShares(steth)
        : wrap.convertStethToWsteth(steth);
    },
  });
};
