import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';
import { useModal } from 'shared/hooks';
import { MODAL } from 'providers';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { openModal } = useModal(MODAL.connect);

  return (
    <Button onClick={openModal} {...rest}>
      Connect wallet
    </Button>
  );
};
