import { useFormState } from 'react-hook-form';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';
import { Connect, DisabledButton } from 'shared/wallet';

type SubmitButtonHookFormProps = Partial<
  React.ComponentProps<typeof ButtonIcon>
> & {
  errorField?: string;
  isLocked?: boolean;
};

export const SubmitButtonHookForm: React.FC<SubmitButtonHookFormProps> = ({
  isLocked,
  errorField,
  icon,
  disabled: disabledProp,
  ...props
}) => {
  const { isDappActive, isSupportedChain, isWalletConnected } = useDappStatus();
  const {
    isValidating,
    isSubmitting,
    disabled: disabledFormState,
  } = useFormState();

  if (!isWalletConnected) {
    return <Connect fullwidth />;
  }

  if (!isSupportedChain || !isDappActive) {
    return <DisabledButton>{props.children}</DisabledButton>;
  }
  const disabled = disabledFormState || disabledProp;

  return (
    <ButtonIcon
      fullwidth
      type="submit"
      loading={isValidating || isSubmitting}
      icon={icon || isLocked ? <Lock /> : <></>}
      disabled={disabled}
      {...props}
    />
  );
};
