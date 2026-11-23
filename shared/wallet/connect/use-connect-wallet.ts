import { useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo';
import { useUserConfig } from 'config/user-config';

// the click of any "Connect wallet" button: tracked, and inert where not allowed
export const useConnectWallet = () => {
  const { isWalletConnectionAllowed } = useUserConfig();
  const { connect } = useConnect();

  const handleConnect = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => {
      if (!isWalletConnectionAllowed) return;
      void connect();
    }, [isWalletConnectionAllowed, connect]),
  );

  return { isWalletConnectionAllowed, handleConnect };
};
