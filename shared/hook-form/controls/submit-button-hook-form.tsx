import { useWeb3 } from 'reef-knot/web3-react';
import { useFormState } from 'react-hook-form';

import { ButtonIcon, Lock } from '@lidofinance/lido-ui';
import { Connect } from 'shared/wallet';
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
  const { active } = useWeb3();
  const { isValidating, isSubmitting } = useFormState();
  const { errors } = useFormState<Record<string, unknown>>();
  const disabled =
    (errorField &&
      !!errors[errorField] &&
      isValidationErrorTypeValidate(errors[errorField]?.type)) ||
    disabledProp;

  if (!active) return <Connect fullwidth />;

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
