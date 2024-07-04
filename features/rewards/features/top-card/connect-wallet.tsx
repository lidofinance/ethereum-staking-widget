import { FC, useCallback } from 'react';
import styled from 'styled-components';
import { useConnect } from 'reef-knot/core-react';
import { Button } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { useUserConfig } from 'config/user-config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { WalletCardStyle } from 'shared/wallet/card/styles';

const ConnectWalletStyle = styled(WalletCardStyle)`
  padding: 27px 27px 47px 27px;
  text-align: center;
  background: linear-gradient(48.34deg, #d2ddff -5.55%, #e6e6e6 100%);

  > p {
    color: var(--lido-color-secondary);
  }

  > p:not(:last-child) {
    margin-bottom: 12px;
  }
`;

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
      <p>Connect your wallet to view staking stats</p>
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
