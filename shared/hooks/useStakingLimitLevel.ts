import { LIMIT_LEVEL } from 'types';
import { getLimitLevel } from 'utils/stakingLimit';
import { useStakeFormData } from 'features/stake/stake-form/stake-form-context';

export const useStakingLimitLevel = (): LIMIT_LEVEL | null => {
  const { stakingLimitInfo } = useStakeFormData();

  if (!stakingLimitInfo) return null;

  const limitLevel = getLimitLevel(
    stakingLimitInfo.maxStakeLimit,
    stakingLimitInfo.currentStakeLimit,
  );

  return limitLevel;
};
