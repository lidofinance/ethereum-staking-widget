import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useDappStatus, useLidoSDK, useLidoSDKL2 } from 'modules/web3';

import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { isSupportedL2Chain } from 'consts/chains';

export const useWstethBySteth = (steth?: bigint | null, chainId?: number) => {
  const { chainId: currentChainId } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2 } = useLidoSDKL2();

  return useQuery({
    queryKey: [
      'use-wsteth-by-steth',
      { steth, chainId: chainId ?? currentChainId },
    ] as const,
    enabled: steth != null,
    ...STRATEGY_CONSTANT,
    queryFn: ({ queryKey }) => {
      if (steth === 0n) return 0n;
      invariant(steth);

      const chainId = queryKey[1].chainId;

      const isL2 = isSupportedL2Chain(chainId);

      return isL2
        ? l2.steth.convertToShares(steth)
        : wrap.convertStethToWsteth(steth);
    },
  });
};
