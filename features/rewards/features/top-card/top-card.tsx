import { FC } from 'react';
import { useAccount } from 'wagmi';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { Fallback } from 'shared/wallet';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

import { Wallet } from './wallet';
import { ConnectWallet } from './connect-wallet';

export const TopCard: FC = () => {
  const { isConnected } = useAccount();
  const isActiveWallet = useIsConnectedWalletAndSupportedChain();

  return (
    <>
      {!isConnected && <ConnectWallet />}

      {isConnected && !isActiveWallet && <Fallback />}

      {isConnected && isActiveWallet && <Wallet />}
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
