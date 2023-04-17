import { useStakingLimitLevel } from 'shared/hooks/useStakingLimitLevel';
import { LIMIT_LEVEL } from 'types';

export const useStakingLimitWarn = () => {
  const limitLevel = useStakingLimitLevel();

  const limitWarning =
    limitLevel === LIMIT_LEVEL.WARN
      ? 'Stake limit is almost exhausted. Your transaction may not go through.'
      : '';

  const limitError =
    limitLevel === LIMIT_LEVEL.WARN
      ? 'Stake limit is exhausted. Please wait until the limit is restored.'
      : '';

  return {
    limitError,
    limitWarning,
    limitReached: limitLevel === LIMIT_LEVEL.REACHED,
  };
};
