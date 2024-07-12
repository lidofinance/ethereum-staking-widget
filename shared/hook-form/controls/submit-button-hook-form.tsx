import { useFormState } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';

import { useIsSupportedChain } from 'shared/hooks/use-is-supported-chain';
import { Connect, UnsupportedChainButton } from 'shared/wallet';

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
  const { isConnected } = useAccount();
  const isSupportedChain = useIsSupportedChain();

  const { isValidating, isSubmitting } = useFormState();
  const { errors } = useFormState<Record<string, unknown>>();

  if (!isConnected) {
    return <Connect fullwidth />;
  }

  if (!isSupportedChain) {
    return <UnsupportedChainButton />;
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
      disabled={disabled}
      icon={icon || isLocked ? <Lock /> : <></>}
      {...props}
    />
  );
};
