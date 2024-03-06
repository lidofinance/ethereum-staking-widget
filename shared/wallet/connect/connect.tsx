import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';
import { useModal } from 'shared/hooks';
import { MODAL } from 'providers';
import { MATOMO_CLICK_EVENTS } from 'config';
import { useClientConfig } from 'providers/client-config';

export const Connect: FC<ButtonProps> = (props) => {
  const { isWalletConnectionAllowed } = useClientConfig();
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.connect);

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    openModal,
  );

  return (
    <Button
      disabled={!isWalletConnectionAllowed}
      onClick={handleClick}
      data-testid="connectBtn"
      {...rest}
    >
      Connect wallet
    </Button>
  );
};
