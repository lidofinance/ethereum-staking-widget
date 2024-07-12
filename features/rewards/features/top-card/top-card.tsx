import { FC } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useConnectionStatuses } from 'shared/hooks/use-connection-statuses';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { ConnectWallet } from './connect-wallet';

export const TopCard: FC = () => {
  const { isConnected, isDappActive } = useConnectionStatuses();

  return (
    <>
      {!isConnected && <ConnectWallet />}

      {!isDappActive && <Fallback />}

      {isDappActive && <Wallet />}
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
