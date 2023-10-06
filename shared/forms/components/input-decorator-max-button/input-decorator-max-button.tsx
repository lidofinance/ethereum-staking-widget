import { MouseEventHandler, MouseEvent, useRef } from 'react';

import {
  MATOMO_CLICK_EVENTS_TYPES,
  trackMatomoEvent,
} from 'config/trackMatomoEvent';
import { useRequestFormData } from 'features/withdrawals/request/request-form-context';

import { MaxButton } from './styled';

type InputDecoratorMaxButtonProps = {
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const InputDecoratorMaxButton = ({
  disabled,
  onClick,
}: InputDecoratorMaxButtonProps) => {
  const thisComponentInsideWithdrawalsRequestFormRef = useRef(false);

  try {
    void useRequestFormData();
    thisComponentInsideWithdrawalsRequestFormRef.current = true;
  } catch {
    /* Not error: it's not withdrawals request form */
  }

  return (
    <MaxButton
      size="xxs"
      variant="translucent"
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (thisComponentInsideWithdrawalsRequestFormRef.current) {
          trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.withdrawalMaxInput);
        }
      }}
      disabled={disabled}
      data-testid="maxBtn"
    >
      MAX
    </MaxButton>
  );
};
