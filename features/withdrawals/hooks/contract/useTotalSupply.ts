import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useTotalSupply = () => {
  const { shares } = useLidoSDK();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['use-total-supply', shares],
    enabled: !!shares,
    // TODO: NEW SDK (STRATEGY_LAZY)
    staleTime: Infinity,
    queryFn: () => shares.getTotalSupply(),
  });

  return {
    data,
    initialLoading: isLoading && !data && !error,
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};
