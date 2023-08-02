import { LIMIT_LEVEL } from 'types';
import { getLimitLevel } from 'utils/stakingLimit';
import { useStakingLimitInfo } from './useStakingLimitInfo';

export const useStakingLimitLevel = (): LIMIT_LEVEL | null => {
  const { data, error } = useStakingLimitInfo();

  if (error || !data?.isStakingLimitSet || !data.maxStakeLimit) return null;

  const limitLevel = getLimitLevel(data.maxStakeLimit, data.currentStakeLimit);

  return limitLevel;
};
