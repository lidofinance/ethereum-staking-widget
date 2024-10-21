import { FC, useEffect, useState } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { useDappStatus } from 'modules/web3';

export const TopCard: FC = () => {
  const [visible, setVisible] = useState(false);
  const { isSupportedChain } = useDappStatus();
  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      {!isSupportedChain ? <Fallback /> : <Wallet />}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
