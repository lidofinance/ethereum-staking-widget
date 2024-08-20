import { FC, useEffect, useState } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  const [visible, setVisible] = useState(false);
  const { isDappActive } = useDappStatus();

  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  return !visible ? null : (
    <>
      {isDappActive && <Wallet />}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
