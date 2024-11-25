import { parseEther } from 'viem';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { LIMIT_LEVEL } from 'types';
import { useLidoSDK } from 'modules/web3';

export type StakeLimitFullInfo = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  currentStakeLimit: bigint;
  maxStakeLimit: bigint;
  maxStakeLimitGrowthBlocks: bigint;
  prevStakeLimit: bigint;
  prevStakeBlockNumber: bigint;
  stakeLimitLevel: LIMIT_LEVEL;
};

const stakeLimitFullInfoMockTemplate: StakeLimitFullInfo = {
  isStakingPaused: false,
  isStakingLimitSet: true,
  currentStakeLimit: parseEther('150000'),
  maxStakeLimit: parseEther('150000'),
  maxStakeLimitGrowthBlocks: 6_400n,
  prevStakeLimit: parseEther('149000'),
  prevStakeBlockNumber: 15_145_339n,
  stakeLimitLevel: LIMIT_LEVEL.REACHED,
};

const WARN_THRESHOLD_RATIO = 4n;

const getLimitLevel = (maxLimit: bigint, currentLimit: bigint) => {
  if (currentLimit === 0n) return LIMIT_LEVEL.REACHED;

  if (maxLimit / currentLimit >= WARN_THRESHOLD_RATIO) return LIMIT_LEVEL.WARN;

  return LIMIT_LEVEL.SAFE;
};

export const useStakingLimitInfo = (): UseQueryResult<StakeLimitFullInfo> => {
  const { isL2, stake } = useLidoSDK();

  const enabled = !!stake.core && !!stake.core.chainId && !isL2;

  return useQuery<StakeLimitFullInfo>({
    queryKey: [
      'get-stake-limit-full-info',
      stake.core.chainId,
      config.enableQaHelpers,
    ],
    enabled,
    ...STRATEGY_LAZY,
    refetchInterval: 60000, // 60 seconds
    queryFn: async () => {
      if (!enabled) {
        return;
      }

      const shouldMock = config.enableQaHelpers;
      const mockDataString = window.localStorage.getItem(
        'getStakeLimitFullInfo',
      );

      if (shouldMock && mockDataString) {
        try {
          const mockData = JSON.parse(mockDataString);
          return {
            ...stakeLimitFullInfoMockTemplate,
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

      const contract = await stake.getContractStETH();
      const [
        isStakingPaused,
        isStakingLimitSet,
        currentStakeLimit,
        maxStakeLimit,
        maxStakeLimitGrowthBlocks,
        prevStakeLimit,
        prevStakeBlockNumber,
      ] = await contract.read.getStakeLimitFullInfo();

      return {
        isStakingPaused,
        isStakingLimitSet,
        currentStakeLimit,
        maxStakeLimit,
        maxStakeLimitGrowthBlocks,
        prevStakeLimit,
        prevStakeBlockNumber,
        stakeLimitLevel: getLimitLevel(maxStakeLimit, currentStakeLimit),
      };
    },
  });
};
