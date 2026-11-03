import { useQuery } from '@tanstack/react-query';
import { STRATEGY_MANIFEST } from 'consts/react-query-strategies';
import { LIDO_L2_STAKING_QUERY_SCOPE } from 'modules/l2-staking';
import { useLidoSDKL2 } from 'modules/web3';

// The lane's CCIP bucket in stake terms. Polled: it refills every second
// and every send on the lane, ours or not, consumes it
export const useSlowStakeLimits = () => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  return useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'slow-stake-limits', { chainId }],
    enabled: isL2Stake,
    ...STRATEGY_MANIFEST,
    queryFn: () => l2Stake.fetchSlowStakeLimits(),
  });
};
