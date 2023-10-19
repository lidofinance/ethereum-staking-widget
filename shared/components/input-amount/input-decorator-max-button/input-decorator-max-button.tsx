import { MouseEventHandler } from 'react';
import { MaxButton } from './styled';

type InputDecoratorMaxButtonProps = {
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const InputDecoratorMaxButton = ({
  disabled,
  onClick,
}: InputDecoratorMaxButtonProps) => {
  return (
    <MaxButton
      size="xxs"
      variant="translucent"
      onClick={onClick}
      disabled={disabled}
      data-testid="maxBtn"
    >
      MAX
    </MaxButton>
  );
};
