import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';

export const useTotalSupply = (): UseQueryResult<bigint | undefined> => {
  const { stETH } = useLidoSDK();

  return useQuery({
    queryKey: ['use-total-supply', stETH.core.chainId],
    queryFn: async () => stETH.totalSupply(),
    ...STRATEGY_LAZY,
    enabled: !!stETH,
  });
};
