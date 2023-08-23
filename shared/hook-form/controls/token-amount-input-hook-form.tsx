import { useController, useWatch } from 'react-hook-form';

import { InputAmount } from 'shared/forms/components/input-amount';

import { getTokenDisplayName } from 'utils/getTokenDisplayName';
import { isValidationErrorTypeDefault } from 'shared/hook-form/validation/validation-error';
import type { BigNumber } from 'ethers';

type TokenAmountInputHookFormProps = Partial<
  React.ComponentProps<typeof InputAmount>
> & {
  isLocked?: boolean;
  maxValue?: BigNumber;
  tokenFieldName?: string;
  valueFieldName?: string;
};

export const TokenAmountInputHookForm = ({
  isLocked,
  maxValue,
  tokenFieldName = 'token',
  valueFieldName = 'amount',
  ...props
}: TokenAmountInputHookFormProps) => {
  const token = useWatch({ name: tokenFieldName });
  const {
    field,
    fieldState: { error },
  } = useController({ name: valueFieldName });

  return (
    <InputAmount
      {...props}
      fullwidth
      error={isValidationErrorTypeDefault(error?.type)}
      isLocked={isLocked}
      maxValue={maxValue}
      label={`${getTokenDisplayName(token)} amount`}
      {...field}
    />
  );
};
