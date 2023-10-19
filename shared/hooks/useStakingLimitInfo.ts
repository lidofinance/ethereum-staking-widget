import { parseEther } from '@ethersproject/units';
import { CHAINS } from '@lido-sdk/constants';
import { StethAbi } from '@lido-sdk/contracts';
import { useSDK, useSTETHContractRPC } from '@lido-sdk/react';
import { enableQaHelpers } from 'utils';
import useSwr from 'swr';
import { BigNumber } from 'ethers';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export type StakeLimitFullInfo = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  currentStakeLimit: BigNumber;
  maxStakeLimit: BigNumber;
  maxStakeLimitGrowthBlocks: BigNumber;
  prevStakeLimit: BigNumber;
  prevStakeBlockNumber: BigNumber;
};

const stakeLimitFullInfoTemplate: StakeLimitFullInfo = {
  isStakingPaused: false,
  isStakingLimitSet: true,
  currentStakeLimit: parseEther('150000'),
  maxStakeLimit: parseEther('150000'),
  maxStakeLimitGrowthBlocks: BigNumber.from(6400),
  prevStakeLimit: parseEther('149000'),
  prevStakeBlockNumber: BigNumber.from(15145339),
};

export const useStakingLimitInfo = () => {
  const { chainId } = useSDK();
  const steth = useSTETHContractRPC();

  return useSwr<StakeLimitFullInfo>(
    ['swr:getStakeLimitFullInfo', chainId, steth, enableQaHelpers],
    async (
      _key: string,
      _chainId: CHAINS,
      steth: StethAbi,
      shouldMock: boolean,
    ) => {
      const mockDataString = window.localStorage.getItem(
        'getStakeLimitFullInfo',
      );

      if (shouldMock && mockDataString) {
        try {
          const mockData = JSON.parse(mockDataString);
          return {
            ...stakeLimitFullInfoTemplate,
            ...mockData,
            currentStakeLimit: parseEther(mockData.currentStakeLimit),
            maxStakeLimit: parseEther(mockData.maxStakeLimit),
          };
        } catch (e) {
          console.warn('Failed to load mock data');
          console.warn(e);
        }
      }

      const stakeLimitFullInfo = await steth.getStakeLimitFullInfo();

      // destructuring to make hybrid array into an object,
      return {
        ...stakeLimitFullInfo,
      };
    },
    {
      ...STRATEGY_LAZY,
      refreshInterval: 30000,
    },
  );
};
