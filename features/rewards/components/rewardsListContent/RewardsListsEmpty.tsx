import { FC, useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';

import { Button, Divider } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';

import { RewardsListEmptyWrapper } from './RewardsListsEmptyStyles';

export const RewardsListsEmpty: FC = () => {
  const { connect } = useConnect();

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => {
      void connect();
    }, [connect]),
  );

  return (
    <>
      <Divider indents="lg" />
      <RewardsListEmptyWrapper>
        <Button size={'sm'} onClick={handleClick}>
          Connect wallet
        </Button>
      </RewardsListEmptyWrapper>
    </>
  );
};
