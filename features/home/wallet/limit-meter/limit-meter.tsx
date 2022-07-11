import { useStakingLimitInfo } from 'shared/hooks';
import { LimitHelp } from './components';
import { getLimitLevel } from './utils';

export const LimitMeter = () => {
  const { data, error } = useStakingLimitInfo();

  if (error || !data?.isStakingLimitSet) return null;

  const limitLevel = getLimitLevel(data.maxStakeLimit, data.currentStakeLimit);

  return <LimitHelp limitLevel={limitLevel} />;
};
