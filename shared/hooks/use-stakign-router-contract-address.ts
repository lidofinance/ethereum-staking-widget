import type { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoSDK } from 'modules/web3';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

export const useStakingRouterAddress = () => {
  const { core } = useLidoSDK();

  return useLidoQuery({
    queryKey: ['staking-router-address', core.chainId],
    enabled: !!core && !!core.chainId,
    strategy: STRATEGY_CONSTANT,
    queryFn: async () => {
      // TODO:
      //  import { LIDO_CONTRACT_NAMES } from '@lidofinance/lido-ethereum-sdk/common';
      //  ...
      //  LIDO_CONTRACT_NAMES is undefined (works only as Type)
      const address = await core.getContractAddress(
        'stakingRouter' as LIDO_CONTRACT_NAMES,
      );
      return address;
    },
  });
};
