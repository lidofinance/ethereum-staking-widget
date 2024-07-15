import { FC, useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';
import { Button } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { useUserConfig } from 'config/user-config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import { ConnectWalletStyle, ConnectWalletTextStyle } from './styles';

export const ConnectWallet: FC = () => {
  const { isWalletConnectionAllowed } = useUserConfig();
  const { connect } = useConnect();

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => {
      if (!isWalletConnectionAllowed) return;
      void connect();
    }, [isWalletConnectionAllowed, connect]),
  );

  return (
    <ConnectWalletStyle>
      <ConnectWalletTextStyle>
        Connect your wallet to view staking stats
      </ConnectWalletTextStyle>
      <Button
        color={'secondary'}
        variant={'outlined'}
        size={'sm'}
        disabled={!isWalletConnectionAllowed}
        onClick={handleClick}
      >
        Connect wallet
      </Button>
    </ConnectWalletStyle>
  );
};
