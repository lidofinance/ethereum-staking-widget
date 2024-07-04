import { useWeb3 } from 'reef-knot/web3-react';
import { useFormState } from 'react-hook-form';
import { ButtonIcon, Lock } from '@lidofinance/lido-ui';

import { config } from 'config';
import { Connect, UnsupportedChainButton } from 'shared/wallet';
import { useChainIdWithoutAccount } from 'shared/hooks/use-chain-id-without-account';

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
  const chainId = useChainIdWithoutAccount();
  const { active } = useWeb3();
  const { isValidating, isSubmitting } = useFormState();
  const { errors } = useFormState<Record<string, unknown>>();
  const disabled =
    (errorField &&
      !!errors[errorField] &&
      isValidationErrorTypeValidate(errors[errorField]?.type)) ||
    disabledProp;

  if (!active) {
    if (chainId && config.supportedChains.indexOf(chainId) > -1) {
      return <Connect fullwidth />;
    }

    return <UnsupportedChainButton />;
  }

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
