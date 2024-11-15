import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery, UseLidoQueryResult } from 'shared/hooks/use-lido-query';
import { useLidoSDK } from 'modules/web3';

// TODO
// import { SharesTotalSupplyResult } from '@lidofinance/lido-ethereum-sdk/shares';
type SharesTotalSupplyResult = {
  totalShares: bigint;
  totalEther: bigint;
};

export const useTotalSupply = (): UseLidoQueryResult<
  SharesTotalSupplyResult | undefined
> => {
  const { shares } = useLidoSDK();

  return useLidoQuery({
    queryKey: ['use-total-supply', shares],
    queryFn: async () => shares.getTotalSupply(),
    strategy: STRATEGY_LAZY,
    enabled: !!shares,
  });
};
