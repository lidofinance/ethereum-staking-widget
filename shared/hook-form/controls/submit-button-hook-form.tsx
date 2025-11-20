import { useFormState } from 'react-hook-form';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';
import { Connect, DisabledButton } from 'shared/wallet';

import { isValidationErrorTypeValidate } from '../validation/validation-error';

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
  const { isValidating, isSubmitting } = useFormState();
  const { errors } = useFormState<Record<string, unknown>>();

  if (!isWalletConnected) {
    return <Connect fullwidth />;
  }

  if (!isSupportedChain || !isDappActive) {
    return <DisabledButton>{props.children}</DisabledButton>;
  }
  const disabled =
    (errorField &&
      !!errors[errorField] &&
      isValidationErrorTypeValidate(errors[errorField]?.type)) ||
    disabledProp;

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
