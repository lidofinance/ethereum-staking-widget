import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';

import { MATOMO_CLICK_EVENTS } from 'consts/matomo-click-events';
import { useModal } from 'shared/hooks';
import { MODAL } from 'providers';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.connect);

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    openModal,
  );

  return (
    <Button onClick={handleClick} data-testid="connectBtn" {...rest}>
      Connect wallet
    </Button>
  );
};
