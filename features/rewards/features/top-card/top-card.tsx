import { FC, useEffect, useState } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';

export const TopCard: FC = () => {
  const [visible, setVisible] = useState(false);
  const { isWalletConnected, isSupportedChain } = useDappStatus();

  // fix flash after reload page
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <>
      {isWalletConnected && !isSupportedChain ? <Fallback /> : <Wallet />}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
