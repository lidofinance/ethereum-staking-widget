import { LIMIT_LEVEL } from 'types';
import { useDappStatus } from './use-dapp-status';

export const useStakingLimitWarning = (stakingLimitLevel?: LIMIT_LEVEL) => {
  const { isDappActiveOnL1 } = useDappStatus();
  const limitWarning =
    stakingLimitLevel === LIMIT_LEVEL.WARN && isDappActiveOnL1
      ? 'Stake limit is almost exhausted. Your transaction may not go through.'
      : null;

  const limitError =
    stakingLimitLevel === LIMIT_LEVEL.REACHED && isDappActiveOnL1
      ? 'Stake limit is exhausted. Please wait until the limit is restored.'
      : null;

  return { limitWarning, limitError };
};
