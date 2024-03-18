import { useController } from 'react-hook-form';

import { InputAmount } from 'shared/components/input-amount';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { isValidationErrorTypeValidate } from 'shared/hook-form/validation/validation-error';
import type { BigNumber } from 'ethers';

type TokenAmountInputHookFormProps = Partial<
  React.ComponentProps<typeof InputAmount>
> & {
  isLocked?: boolean;
  maxValue?: BigNumber;
  token: Parameters<typeof getTokenDisplayName>[0];
  fieldName: string;
  showErrorMessage?: boolean;
};

export const TokenAmountInputHookForm = ({
  isLocked,
  maxValue,
  token,
  fieldName,
  showErrorMessage = true,
  error: errorProp,
  ...props
}: TokenAmountInputHookFormProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name: fieldName });
  const hasErrorHighlight = isValidationErrorTypeValidate(error?.type);
  // allows to show error state without message
  const errorMessage = hasErrorHighlight && (error?.message || true);
  return (
    <InputAmount
      {...props}
      {...field}
      disabled={props.disabled ?? field.disabled}
      error={errorProp ?? (showErrorMessage ? errorMessage : hasErrorHighlight)}
      isLocked={isLocked}
      maxValue={maxValue}
      label={`${getTokenDisplayName(token)} amount`}
      fullwidth
    />
  );
};
