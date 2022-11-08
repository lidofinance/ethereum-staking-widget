import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { wrapWithEventTrack } from '@lidofinance/analytics-matomo';
import { useModal } from 'shared/hooks';
import { MODAL } from 'providers';
import { MATOMO_EVENTS } from 'config';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.connect);

  const handleClick = wrapWithEventTrack(
    MATOMO_EVENTS.connectWallet,
    openModal,
  );

  return (
    <Button onClick={handleClick} {...rest}>
      Connect wallet
    </Button>
  );
};
