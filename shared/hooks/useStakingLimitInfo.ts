import { BigNumber } from 'ethers';

import { parseEther } from '@ethersproject/units';
import { CHAINS } from '@lido-sdk/constants';
import { StethAbi } from '@lido-sdk/contracts';
import { useLidoSWR, useSDK, useSTETHContractRPC } from '@lido-sdk/react';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { LIMIT_LEVEL } from 'types';

export type StakeLimitFullInfo = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  currentStakeLimit: BigNumber;
  maxStakeLimit: BigNumber;
  maxStakeLimitGrowthBlocks: BigNumber;
  prevStakeLimit: BigNumber;
  prevStakeBlockNumber: BigNumber;
  stakeLimitLevel: LIMIT_LEVEL;
};

const stakeLimitFullInfoTemplate: StakeLimitFullInfo = {
  isStakingPaused: false,
  isStakingLimitSet: true,
  currentStakeLimit: parseEther('150000'),
  maxStakeLimit: parseEther('150000'),
  maxStakeLimitGrowthBlocks: BigNumber.from(6400),
  prevStakeLimit: parseEther('149000'),
  prevStakeBlockNumber: BigNumber.from(15145339),
  stakeLimitLevel: LIMIT_LEVEL.REACHED,
};

// almost reached whenever current limit is ≤25% of max limit, i.e. 4 times lower
const WARN_THRESHOLD_RATIO = BigNumber.from(4);

const getLimitLevel = (maxLimit: BigNumber, currentLimit: BigNumber) => {
  if (currentLimit.eq(0)) return LIMIT_LEVEL.REACHED;

  if (maxLimit.div(currentLimit).gte(WARN_THRESHOLD_RATIO))
    return LIMIT_LEVEL.WARN;

  return LIMIT_LEVEL.SAFE;
};

export const useStakingLimitInfo = () => {
  const { chainId } = useSDK();
  const steth = useSTETHContractRPC();

  return useLidoSWR<StakeLimitFullInfo>(
    ['swr:getStakeLimitFullInfo', chainId, steth, config.enableQaHelpers],
    // @ts-expect-error broken lidoSWR typings
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
            stakeLimitLevel: getLimitLevel(
              parseEther(mockData.maxStakeLimit),
              parseEther(mockData.currentStakeLimit),
            ),
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
        stakeLimitLevel: getLimitLevel(
          stakeLimitFullInfo.maxStakeLimit,
          stakeLimitFullInfo.currentStakeLimit,
        ),
      };
    },
    {
      ...STRATEGY_LAZY,
      refreshInterval: 60000,
    },
  );
};
