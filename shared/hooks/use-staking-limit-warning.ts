import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { LIMIT_LEVEL } from 'types';

export const useStakingLimitWarning = (stakingLimitLevel?: LIMIT_LEVEL) => {
  const { isDappActive } = useDappStatus();
  const limitWarning =
    stakingLimitLevel === LIMIT_LEVEL.WARN && isDappActive
      ? 'Stake limit is almost exhausted. Your transaction may not go through.'
      : null;

  const limitError =
    stakingLimitLevel === LIMIT_LEVEL.REACHED && isDappActive
      ? 'Stake limit is exhausted. Please wait until the limit is restored.'
      : null;

  return { limitWarning, limitError };
};
