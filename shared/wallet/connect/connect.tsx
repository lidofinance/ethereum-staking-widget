import { FC, useCallback } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';
import { MATOMO_CLICK_EVENTS } from 'config';
import { useConnectWalletModal } from '../connect-wallet-modal/use-connect-wallet-modal';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useConnectWalletModal();

  const handleClick = wrapWithEventTrack(
    MATOMO_CLICK_EVENTS.connectWallet,
    useCallback(() => openModal({}), [openModal]),
  );

  return (
    <Button onClick={handleClick} data-testid="connectBtn" {...rest}>
      Connect wallet
    </Button>
  );
};
