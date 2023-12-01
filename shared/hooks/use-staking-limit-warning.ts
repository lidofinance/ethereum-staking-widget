import { useWeb3 } from 'reef-knot/web3-react';
import { LIMIT_LEVEL } from 'types';

export const useStakingLimitWarning = (stakingLimitLevel?: LIMIT_LEVEL) => {
  const { active } = useWeb3();
  const limitWarning =
    stakingLimitLevel === LIMIT_LEVEL.WARN && active
      ? 'Stake limit is almost exhausted. Your transaction may not go through.'
      : null;

  return limitWarning;
};
