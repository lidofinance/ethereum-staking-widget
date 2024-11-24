import { useQuery } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useUnfinalizedStETH = () => {
  const { withdraw } = useLidoSDK();

  return useQuery({
    queryKey: ['use-unfinalized-stETH', withdraw.core.chainId],
    enabled: !!withdraw,
    ...STRATEGY_LAZY,
    staleTime: Infinity,
    queryFn: () => withdraw.views.getUnfinalizedStETH(),
  });
};
