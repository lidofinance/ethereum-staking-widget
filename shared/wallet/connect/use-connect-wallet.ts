import { useCallback } from 'react';
import { useConnectionFlow } from 'reef-knot';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo';
import { useUserConfig } from 'config/user-config';

// the click of any "Connect wallet" button: tracked, and inert where not allowed
export const useConnectWallet = () => {
  const { isWalletConnectionAllowed } = useUserConfig();
  const { startConnection } = useConnectionFlow();

  const handleConnect = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => {
      if (!isWalletConnectionAllowed) return;
      void startConnection();
    }, [isWalletConnectionAllowed, startConnection]),
  );

  return { isWalletConnectionAllowed, handleConnect };
};
