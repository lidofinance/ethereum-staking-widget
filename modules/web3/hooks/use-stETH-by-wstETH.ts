import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useDappStatus, useLidoSDK, useLidoSDKL2 } from 'modules/web3';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { isSupportedL2Chain } from 'consts/chains';

export const useStETHByWstETH = (wsteth?: bigint | null, chainId?: number) => {
  const { chainId: currentChainId } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { l2 } = useLidoSDKL2();

  return useQuery({
    queryKey: [
      'use-steth-by-wsteth',
      { wsteth, chainId: chainId ?? currentChainId },
    ] as const,
    enabled: wsteth != null,
    ...STRATEGY_CONSTANT,
    queryFn: ({ queryKey }) => {
      if (wsteth === 0n) return 0n;
      invariant(wsteth);

      const chainId = queryKey[1].chainId;

      const isL2 = isSupportedL2Chain(chainId);

      return isL2
        ? l2.steth.convertToSteth(wsteth)
        : wrap.convertWstethToSteth(wsteth);
    },
  });
};
