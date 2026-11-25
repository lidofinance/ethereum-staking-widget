import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { useLidoSDK, useLidoSDKL2 } from 'modules/web3';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';

export const useStETHByWstETH = (wsteth?: bigint | null) => {
  const { wrap } = useLidoSDK();
  const { l2, isL2, chainId } = useLidoSDKL2();

  return useQuery({
    queryKey: ['use-steth-by-wsteth', { wsteth, chainId }],
    enabled: wsteth != null,
    ...STRATEGY_CONSTANT,
    queryFn: () => {
      if (wsteth === 0n) return 0n;
      invariant(wsteth);

      return isL2
        ? l2.steth.convertToSteth(wsteth)
        : wrap.convertWstethToSteth(wsteth);
    },
  });
};
