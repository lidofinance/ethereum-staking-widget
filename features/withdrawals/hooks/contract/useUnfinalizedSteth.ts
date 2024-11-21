import { useQuery } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useUnfinalizedStETH = () => {
  const { withdraw } = useLidoSDK();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['use-unfinalized-stETH', withdraw.core.chainId],
    enabled: !!withdraw,
    ...STRATEGY_LAZY,
    staleTime: Infinity,
    queryFn: () => withdraw.views.getUnfinalizedStETH(),
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
