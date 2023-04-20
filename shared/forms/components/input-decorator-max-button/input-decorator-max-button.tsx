import { MaxButton } from './styled';

type InputDecoratorMaxButtonProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
    >
      MAX
    </MaxButton>
  );
};
