import { FC } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { ConnectWallet } from './connect-wallet';

export const TopCard: FC = () => {
  const { isWalletConnected, isDappActive } = useDappStatus();

  return (
    <>
      {!isWalletConnected && <ConnectWallet />}

      {!isDappActive && <Fallback />}

      {isDappActive && <Wallet />}

      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
