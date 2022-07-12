import { useStakingLimitLevel } from 'shared/hooks/useStakingLimitLevel';
import { LimitHelp } from './components';

export const LimitMeter = () => {
  const limitLevel = useStakingLimitLevel();

  if (limitLevel === null) return null;

  return <LimitHelp limitLevel={limitLevel} />;
};
