import { useQuery } from '@tanstack/react-query';
import { LIDO_L2_STAKING_QUERY_SCOPE } from 'modules/l2-staking';
import { useLidoSDKL2 } from 'modules/web3';

export const useFastStakeLiquidity = () => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  return useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'liquidity', { chainId }],
    enabled: isL2Stake,
    queryFn: async () => {
      return await l2Stake.getFastStakeLiquidity();
    },
  });
};
