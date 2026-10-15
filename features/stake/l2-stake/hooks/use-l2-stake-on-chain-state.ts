import { useQuery } from '@tanstack/react-query';
import { STRATEGY_MANIFEST } from 'consts/react-query-strategies';
import { LIDO_L2_STAKING_QUERY_SCOPE } from 'modules/l2-staking';
import { useLidoSDKL2 } from 'modules/web3';

// Whether each lane is open on chain. Polled like the manifest: a pause must
// reach an open tab without a reload
export const useL2StakeOnChainState = () => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  return useQuery({
    queryKey: [LIDO_L2_STAKING_QUERY_SCOPE, 'stake-state', { chainId }],
    enabled: isL2Stake,
    ...STRATEGY_MANIFEST,
    queryFn: () => l2Stake.fetchStakeState(),
  });
};
