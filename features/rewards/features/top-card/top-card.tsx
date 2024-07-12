import { FC } from 'react';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { ConnectWallet } from './connect-wallet';

export const TopCard: FC = () => {
  const { isWalletConnected, isDappActive } = useDappStatuses();

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
