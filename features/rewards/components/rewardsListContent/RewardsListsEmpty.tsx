import { FC, useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';
import { Button, Divider } from '@lidofinance/lido-ui';

import { useUserConfig } from 'config/user-config';
import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import {
  RewardsListEmptyText,
  RewardsListEmptyWrapper,
} from './RewardsListsEmptyStyles';

export const RewardsListsEmpty: FC = () => {
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
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <RewardsListEmptyText>
          Connect your wallet to view your staking stats.
        </RewardsListEmptyText>
        <Button
          size={'xs'}
          disabled={!isWalletConnectionAllowed}
          onClick={handleClick}
          data-testid="connectBtn"
        >
          Connect wallet
        </Button>
      </RewardsListEmptyWrapper>
    </>
  );
};
