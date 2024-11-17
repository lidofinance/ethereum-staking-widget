import { parseEther } from 'viem';

import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { LIMIT_LEVEL } from 'types';
import { useLidoSDK } from 'modules/web3';
import { useLidoQuery, UseLidoQueryResult } from 'shared/hooks/use-lido-query';

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
  maxStakeLimitGrowthBlocks: BigInt(6400),
  prevStakeLimit: parseEther('149000'),
  prevStakeBlockNumber: BigInt(15145339),
  stakeLimitLevel: LIMIT_LEVEL.REACHED,
};

const WARN_THRESHOLD_RATIO = BigInt(4);

const getLimitLevel = (maxLimit: bigint, currentLimit: bigint) => {
  if (currentLimit === BigInt(0)) return LIMIT_LEVEL.REACHED;

  if (maxLimit / currentLimit >= WARN_THRESHOLD_RATIO) return LIMIT_LEVEL.WARN;

  return LIMIT_LEVEL.SAFE;
};

export const useStakingLimitInfo =
  (): UseLidoQueryResult<StakeLimitFullInfo> => {
    const { stake } = useLidoSDK();

    return useLidoQuery<StakeLimitFullInfo>({
      queryKey: [
        'query:getStakeLimitFullInfo',
        stake.core.chain,
        config.enableQaHelpers,
      ],
      queryFn: async () => {
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
      strategy: {
        ...STRATEGY_LAZY,
        refetchInterval: 60000, // 60 seconds
      },
    });
  };
