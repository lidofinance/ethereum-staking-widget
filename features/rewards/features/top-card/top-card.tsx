import { FC, useEffect, useState } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  const [visible, setVisible] = useState(false);

  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      <Wallet />
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
