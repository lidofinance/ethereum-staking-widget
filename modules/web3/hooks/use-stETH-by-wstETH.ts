import { useQuery } from '@tanstack/react-query';
import { useLidoSDK } from 'modules/web3';

export const useStETHByWstETH = (wsteth: bigint | undefined) => {
  const { isL2, l2, shares, chainId } = useLidoSDK();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['use-steth-by-wsteth', wsteth?.toString(), isL2, chainId],
    enabled: !!(wsteth && (isL2 ? l2.steth : shares)),
    staleTime: Infinity,
    queryFn: () => {
      if (!wsteth) return undefined;
      return isL2
        ? l2.steth.convertToSteth(wsteth)
        : shares.convertToSteth(wsteth);
    },
  });

  return {
    data,
    initialLoading: isLoading && !data && !error,
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};
