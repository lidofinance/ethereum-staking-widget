import { FC, useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';
import { Button, Divider } from '@lidofinance/lido-ui';

import { useUserConfig } from 'config/user-config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo';
import { useDappStatus } from 'modules/web3';

import {
  RewardsListEmptyButtonWrapper,
  RewardsListEmptyWrapper,
} from './RewardsListsEmptyStyles';

export const RewardsListsEmpty: FC = () => {
  const { isWalletConnectionAllowed } = useUserConfig();
  const { isWalletConnected } = useDappStatus();

  const { connect } = useConnect();

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => {
      if (!isWalletConnectionAllowed) return;
      void connect();
    }, [isWalletConnectionAllowed, connect]),
  );

  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <p>
          Connect your wallet or enter your Ethereum address to see the stats.
        </p>
        {isWalletConnected ? null : (
          <RewardsListEmptyButtonWrapper>
            <Button
              size={'xs'}
              disabled={!isWalletConnectionAllowed}
              onClick={handleClick}
              data-testid="connectBtn"
            >
              Connect wallet
            </Button>
          </RewardsListEmptyButtonWrapper>
        )}
      </RewardsListEmptyWrapper>
    </>
  );
};
