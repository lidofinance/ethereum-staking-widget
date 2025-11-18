import { useRef, useState } from 'react';
import { useFormState } from 'react-hook-form';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';

import { useDappStatus } from 'modules/web3';
import { Connect, DisabledButton } from 'shared/wallet';
import { useAddressValidation } from 'providers/address-validation-provider';

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
  const { isDappActive, isSupportedChain, isWalletConnected, address } =
    useDappStatus();
  const { validateAddress } = useAddressValidation();
  const ref = useRef<HTMLButtonElement>(null);
  const { isValidating, isSubmitting } = useFormState();
  const [isInnerLoading, setIsInnerLoading] = useState(false);
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

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      setIsInnerLoading(true);
      const result = await validateAddress(address);

      // if address is not valid, don't submit the form
      if (!result) return;

      // submit the form
      const form = ref.current?.closest('form');
      if (form) form.requestSubmit();
    } catch (error) {
      console.error('Error in async operation:', error);
    } finally {
      setIsInnerLoading(false);
    }
  };

  return (
    <ButtonIcon
      ref={ref}
      fullwidth
      onClick={handleClick}
      loading={isValidating || isSubmitting || isInnerLoading}
      icon={icon || isLocked ? <Lock /> : <></>}
      disabled={disabled}
      {...props}
    />
  );
};
