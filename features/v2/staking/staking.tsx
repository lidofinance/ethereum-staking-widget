import { SectionTitle } from '@lidofinance/lido-app-ui';

import { Position } from './position';
import { StakingCard } from './styles';

export const Staking = () => {
  return (
    <StakingCard>
      <SectionTitle size="large" title="Liquid staking" />
      <Position />
    </StakingCard>
  );
};
