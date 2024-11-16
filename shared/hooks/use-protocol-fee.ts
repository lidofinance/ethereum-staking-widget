// TODO: NEW SDK
import { formatEther } from '@ethersproject/units';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useDappStatus } from 'modules/web3';

import { useStakingRouter } from './use-stakign-router-contract';

export const useProtocolFee = () => {
  const { chainId } = useDappStatus();
  // TODO: NEW SDK
  const { contractRpc } = useStakingRouter();

  return useLidoQuery({
    queryKey: ['protocol-fee', chainId, contractRpc, config.enableQaHelpers],
    strategy: {
      ...STRATEGY_CONSTANT,
      refetchInterval: 60000, // 1 minute
    },
    enabled: !!chainId && !!contractRpc,
    queryFn: async () => {
      const mockDataString = window.localStorage.getItem('protocolFee');

      if (config.enableQaHelpers && mockDataString) {
        try {
          const mockData = JSON.parse(mockDataString);
          return Number(mockData);
        } catch (e) {
          console.warn('Failed to load mock data');
          console.warn(e);
        }
      }

      const fee = await contractRpc.getStakingFeeAggregateDistribution();
      const value = Number(formatEther(fee.modulesFee.add(fee.treasuryFee)));

      return value.toFixed(0);
    },
  });
};
