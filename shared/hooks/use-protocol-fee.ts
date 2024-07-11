import { formatEther } from '@ethersproject/units';

import { CHAINS } from '@lido-sdk/constants';
import { useLidoSWR, useSDK } from '@lido-sdk/react';
import { useStakingRouter } from './use-stakign-router-contract';
import { PartialStakingRouterAbi } from 'generated/PartialStakingRouterAbi';

import { config } from 'config';
import { STRATEGY_CONSTANT } from 'consts/swr-strategies';

export const useProtocolFee = () => {
  const { chainId } = useSDK();
  const { contractRpc } = useStakingRouter();

  return useLidoSWR<number>(
    ['swr:useProtocolFee', chainId, contractRpc, config.enableQaHelpers],
    // @ts-expect-error broken lidoSWR typings
    async (
      _key: string,
      _chainId: CHAINS,
      contractRpc: PartialStakingRouterAbi,
      shouldMock: boolean,
    ) => {
      const mockDataString = window.localStorage.getItem('protocolFee');

      if (shouldMock && mockDataString) {
        try {
          const mockData = JSON.parse(mockDataString);
          return mockData;
        } catch (e) {
          console.warn('Failed to load mock data');
          console.warn(e);
        }
      }

      const fee = await contractRpc.getStakingFeeAggregateDistribution();
      const value = Number(formatEther(fee.modulesFee.add(fee.treasuryFee)));

      return value.toFixed(0);
    },
    {
      ...STRATEGY_CONSTANT,
      refreshInterval: 60000,
    },
  );
};
