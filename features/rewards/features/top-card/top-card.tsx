import { FC } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  return (
    <>
      <Wallet />
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
